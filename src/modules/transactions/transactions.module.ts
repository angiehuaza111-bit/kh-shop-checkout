import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { GetTransactionUseCase } from './application/use-cases/get-transaction.use-case';
import { HandlePaymentWebhookUseCase } from './application/use-cases/handle-payment-webhook.use-case';
import { ReconcilePendingTransactionsUseCase } from './application/use-cases/reconcile-pending-transactions.use-case';
import { ApplyChargeResultService } from './application/services/apply-charge-result.service';
import { DecreaseStockForTransactionService } from './application/services/decrease-stock-for-transaction.service';
import { PAYMENT_GATEWAY } from './domain/payment-gateway.port';
import { TRANSACTION_REPOSITORY } from './domain/transaction-repository.port';
import { WEBHOOK_EVENT_REPOSITORY } from './domain/webhook-event-repository.port';
import { WEBHOOK_SIGNATURE_VERIFIER } from './domain/webhook-signature-verifier.port';
import { CardPaymentGatewayAdapter } from './infrastructure/payment-gateway/card-payment-gateway.adapter';
import { ChecksumWebhookSignatureVerifier } from './infrastructure/payment-gateway/checksum-webhook-signature.verifier';
import { TransactionItemOrmEntity } from './infrastructure/persistence/transaction-item.orm-entity';
import { TransactionOrmEntity } from './infrastructure/persistence/transaction.orm-entity';
import { TransactionRepository } from './infrastructure/persistence/transaction.repository';
import { WebhookEventOrmEntity } from './infrastructure/persistence/webhook-event.orm-entity';
import { WebhookEventRepository } from './infrastructure/persistence/webhook-event.repository';
import { PendingTransactionsReconciliationScheduler } from './infrastructure/scheduling/pending-transactions-reconciliation.scheduler';
import { TransactionsController } from './presentation/transactions.controller';
import { WebhooksController } from './presentation/webhooks.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransactionOrmEntity,
      TransactionItemOrmEntity,
      WebhookEventOrmEntity,
    ]),
    ProductsModule,
  ],
  controllers: [TransactionsController, WebhooksController],
  providers: [
    CreateTransactionUseCase,
    GetTransactionUseCase,
    HandlePaymentWebhookUseCase,
    ReconcilePendingTransactionsUseCase,
    ApplyChargeResultService,
    DecreaseStockForTransactionService,
    PendingTransactionsReconciliationScheduler,
    { provide: TRANSACTION_REPOSITORY, useClass: TransactionRepository },
    { provide: WEBHOOK_EVENT_REPOSITORY, useClass: WebhookEventRepository },
    { provide: PAYMENT_GATEWAY, useClass: CardPaymentGatewayAdapter },
    { provide: WEBHOOK_SIGNATURE_VERIFIER, useClass: ChecksumWebhookSignatureVerifier },
  ],
})
export class TransactionsModule {}
