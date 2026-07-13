import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExternalServiceDomainError } from '../../../../common/domain/domain-error';
import { Configuration } from '../../../../config/configuration';
import {
  ChargeCardCommand,
  ChargeResult,
  GatewayChargeStatus,
  PaymentGatewayPort,
} from '../../domain/payment-gateway.port';

interface GatewayTransactionData {
  id: string;
  status: string;
  status_message?: string | null;
  payment_method?: { extra?: { last_four?: string; brand?: string } };
}

interface GatewayTransactionResponseBody {
  data: GatewayTransactionData;
}

interface GatewayMerchantResponseBody {
  data: { presigned_acceptance: { acceptance_token: string } };
}

/**
 * Generic card-payment gateway adapter (Ports & Adapters). The concrete provider is fully
 * parameterized through configuration (see [payment] section) so no provider-specific
 * name leaks into the codebase.
 */
@Injectable()
export class CardPaymentGatewayAdapter implements PaymentGatewayPort {
  constructor(private readonly configService: ConfigService<Configuration, true>) {}

  async chargeCard(command: ChargeCardCommand): Promise<ChargeResult> {
    const payment = this.configService.get('payment', { infer: true });
    const acceptanceToken = await this.fetchAcceptanceToken(payment.apiUrl, payment.publicKey);

    const response = await this.request(`${payment.apiUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payment.privateKey}`,
      },
      body: JSON.stringify({
        acceptance_token: acceptanceToken,
        amount_in_cents: command.amountInCents,
        currency: command.currency,
        customer_email: command.customerEmail,
        reference: command.reference,
        signature: this.buildIntegritySignature(command, payment.integrityKey),
        payment_method: {
          type: 'CARD',
          installments: command.installments,
          token: command.cardToken,
        },
      }),
    });

    const body = (await response.json()) as GatewayTransactionResponseBody;
    return this.toChargeResult(body.data);
  }

  async checkStatus(gatewayTransactionId: string): Promise<ChargeResult> {
    const payment = this.configService.get('payment', { infer: true });
    const response = await this.request(`${payment.apiUrl}/transactions/${gatewayTransactionId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${payment.privateKey}` },
    });
    const body = (await response.json()) as GatewayTransactionResponseBody;
    return this.toChargeResult(body.data);
  }

  /**
   * The gateway requires proof that the customer accepted its terms & personal-data
   * policies on every transaction. The acceptance token is tied to the merchant's current
   * policy version (not to the customer), so it is safe to fetch server-side with the
   * public key right before charging, rather than requiring the client to obtain it.
   */
  private async fetchAcceptanceToken(apiUrl: string, publicKey: string): Promise<string> {
    const response = await this.request(`${apiUrl}/merchants/${publicKey}`, { method: 'GET' });
    const body = (await response.json()) as GatewayMerchantResponseBody;
    return body.data.presigned_acceptance.acceptance_token;
  }

  /**
   * The gateway rejects transaction creation without a tamper-proof signature of
   * `reference + amount_in_cents + currency + integrity_secret` (SHA-256 hex digest).
   * Verified against the real sandbox: this exact concatenation order is required.
   */
  private buildIntegritySignature(command: ChargeCardCommand, integrityKey: string): string {
    const raw = `${command.reference}${command.amountInCents}${command.currency}${integrityKey}`;
    return createHash('sha256').update(raw).digest('hex');
  }

  private async request(url: string, init: RequestInit): Promise<Response> {
    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (error) {
      throw new ExternalServiceDomainError(
        error instanceof Error ? error.message : 'Payment gateway request failed',
      );
    }

    if (!response.ok) {
      throw new ExternalServiceDomainError(
        `Payment gateway responded with status ${response.status}`,
      );
    }
    return response;
  }

  private toChargeResult(data: GatewayTransactionData): ChargeResult {
    const status = this.mapStatus(data.status);
    return {
      gatewayTransactionId: data.id,
      status,
      cardLastFour: data.payment_method?.extra?.last_four ?? null,
      cardBrand: data.payment_method?.extra?.brand ?? null,
      failureReason: this.resolveFailureReason(status, data.status_message),
    };
  }

  private resolveFailureReason(
    status: GatewayChargeStatus,
    statusMessage: string | null | undefined,
  ): string | null {
    if (status !== 'DECLINED') {
      return null;
    }
    return statusMessage ?? 'Payment declined';
  }

  private mapStatus(providerStatus: string): GatewayChargeStatus {
    if (providerStatus === 'APPROVED') {
      return 'APPROVED';
    }
    if (
      providerStatus === 'DECLINED' ||
      providerStatus === 'ERROR' ||
      providerStatus === 'VOIDED'
    ) {
      return 'DECLINED';
    }
    return 'PENDING';
  }
}
