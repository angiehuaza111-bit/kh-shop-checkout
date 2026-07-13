import { ValidationDomainError } from '../../../../common/domain/domain-error';
import { WebhookNotification } from '../../application/use-cases/handle-payment-webhook.use-case';

interface RawTransaction {
  id?: string;
  reference?: string;
  status?: string;
  status_message?: string | null;
  payment_method?: { extra?: { last_four?: string; brand?: string } };
}

export interface RawWebhookSignature {
  properties: string[];
  checksum: string;
}

export interface RawWebhookPayload {
  event?: string;
  timestamp?: number;
  signature?: RawWebhookSignature;
  data?: {
    transaction?: RawTransaction;
  };
}

interface CardInfo {
  cardLastFour: string | null;
  cardBrand: string | null;
}

export class WebhookPayloadMapper {
  static toNotification(raw: RawWebhookPayload): WebhookNotification {
    const transaction = this.extractTransaction(raw);
    const isApproved = transaction.status === 'APPROVED';

    return {
      providerEventId: this.buildProviderEventId(raw, transaction),
      reference: transaction.reference as string,
      status: isApproved ? 'APPROVED' : 'DECLINED',
      gatewayTransactionId: transaction.id ?? null,
      ...this.extractCardInfo(transaction),
      failureReason: this.resolveFailureReason(isApproved, transaction.status_message),
      rawPayload: raw as unknown as Record<string, unknown>,
    };
  }

  private static extractCardInfo(transaction: RawTransaction): CardInfo {
    const extra = transaction.payment_method?.extra;
    return {
      cardLastFour: extra?.last_four ?? null,
      cardBrand: extra?.brand ?? null,
    };
  }

  private static extractTransaction(raw: RawWebhookPayload): RawTransaction {
    const transaction = raw.data?.transaction;
    if (!transaction?.reference || !transaction?.status) {
      throw new ValidationDomainError(
        'Malformed webhook payload: missing transaction reference or status',
      );
    }
    return transaction;
  }

  private static buildProviderEventId(raw: RawWebhookPayload, transaction: RawTransaction): string {
    const identifier = transaction.id ?? transaction.reference;
    return `${identifier}:${raw.timestamp ?? ''}`;
  }

  private static resolveFailureReason(
    isApproved: boolean,
    statusMessage: string | null | undefined,
  ): string | null {
    if (isApproved) {
      return null;
    }
    return statusMessage ?? 'Payment declined';
  }
}
