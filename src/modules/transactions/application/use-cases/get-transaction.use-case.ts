import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainError } from '../../../../common/domain/domain-error';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepositoryPort,
} from '../../domain/transaction-repository.port';
import { Transaction } from '../../domain/transaction.entity';

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new NotFoundDomainError('Transaction', id);
    }
    return transaction;
  }
}
