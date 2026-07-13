import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import {
  NotFoundDomainError,
  UnauthorizedDomainError,
} from '../../../../common/domain/domain-error';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepositoryPort,
} from '../../domain/transaction-repository.port';
import {
  WEBHOOK_EVENT_REPOSITORY,
  WebhookEventRepositoryPort,
} from '../../domain/webhook-event-repository.port';
import { WebhookEvent } from '../../domain/webhook-event.entity';
import {
  WEBHOOK_SIGNATURE_VERIFIER,
  WebhookSignatureVerifierPort,
} from '../../domain/webhook-signature-verifier.port';
import { DecreaseStockForTransactionService } from '../services/decrease-stock-for-transaction.service';

export interface WebhookNotification {
  providerEventId: string;
  reference: string;
  status: 'APPROVED' | 'DECLINED';
  gatewayTransactionId: string | null;
  cardLastFour: string | null;
  cardBrand: string | null;
  failureReason: string | null;
  rawPayload: Record<string, unknown>;
}

export interface HandlePaymentWebhookInput {
  rawPayload: Record<string, unknown>;
  notification: WebhookNotification;
}

@Injectable()
export class HandlePaymentWebhookUseCase {
  constructor(
    @Inject(WEBHOOK_SIGNATURE_VERIFIER)
    private readonly signatureVerifier: WebhookSignatureVerifierPort,
    @Inject(WEBHOOK_EVENT_REPOSITORY)
    private readonly webhookEventRepository: WebhookEventRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly decreaseStockService: DecreaseStockForTransactionService,
  ) {}

  async execute(input: HandlePaymentWebhookInput): Promise<void> {
    if (!this.signatureVerifier.verify(input.rawPayload)) {
      throw new UnauthorizedDomainError('Invalid webhook signature');
    }

    const alreadyProcessed = await this.webhookEventRepository.existsByProviderEventId(
      input.notification.providerEventId,
    );
    if (alreadyProcessed) {
      return;
    }

    const event = WebhookEvent.create({
      id: randomUUID(),
      providerEventId: input.notification.providerEventId,
      payload: input.notification.rawPayload,
      signatureValid: true,
    });
    await this.webhookEventRepository.create(event);

    await this.resolveTransaction(input.notification);

    event.markProcessed();
    await this.webhookEventRepository.update(event);
  }

  private async resolveTransaction(notification: WebhookNotification): Promise<void> {
    const transaction = await this.transactionRepository.findByReference(notification.reference);
    if (!transaction) {
      throw new NotFoundDomainError('Transaction', notification.reference);
    }

    if (!transaction.isPending()) {
      return;
    }

    if (notification.status === 'APPROVED') {
      transaction.markApproved({
        gatewayTransactionId: notification.gatewayTransactionId ?? notification.providerEventId,
        cardLastFour: notification.cardLastFour,
        cardBrand: notification.cardBrand,
      });
      await this.transactionRepository.update(transaction);
      await this.decreaseStockService.execute(transaction);
      return;
    }

    transaction.markDeclined({
      gatewayTransactionId: notification.gatewayTransactionId,
      failureReason: notification.failureReason ?? 'Payment declined',
    });
    await this.transactionRepository.update(transaction);
  }
}
