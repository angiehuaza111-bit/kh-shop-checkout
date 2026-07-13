import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, IsNull, Repository } from 'typeorm';
import { Transaction } from '../../domain/transaction.entity';
import { TransactionRepositoryPort } from '../../domain/transaction-repository.port';
import { TransactionStatus } from '../../domain/transaction-status.enum';
import { TransactionMapper } from './transaction.mapper';
import { TransactionOrmEntity } from './transaction.orm-entity';

@Injectable()
export class TransactionRepository implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly repository: Repository<TransactionOrmEntity>,
  ) {}

  async findById(id: string): Promise<Transaction | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? TransactionMapper.toDomain(orm) : null;
  }

  async findByReference(reference: string): Promise<Transaction | null> {
    const orm = await this.repository.findOne({ where: { reference } });
    return orm ? TransactionMapper.toDomain(orm) : null;
  }

  async findPendingWithGatewayReference(): Promise<Transaction[]> {
    const orms = await this.repository.find({
      where: { status: TransactionStatus.PENDING, gatewayTransactionId: Not(IsNull()) },
    });
    return orms.map(TransactionMapper.toDomain);
  }

  async create(transaction: Transaction): Promise<Transaction> {
    const orm = await this.repository.save(TransactionMapper.toOrm(transaction));
    return TransactionMapper.toDomain(orm);
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const orm = await this.repository.save(TransactionMapper.toOrm(transaction));
    return TransactionMapper.toDomain(orm);
  }
}
