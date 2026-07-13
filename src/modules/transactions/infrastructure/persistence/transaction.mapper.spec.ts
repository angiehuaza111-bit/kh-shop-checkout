import { Transaction } from '../../domain/transaction.entity';
import { TransactionMapper } from './transaction.mapper';

describe('TransactionMapper', () => {
  it('maps a domain transaction to an ORM entity and back without losing data', () => {
    const transaction = Transaction.create({
      id: 't-1',
      reference: 'REF-1',
      currency: 'COP',
      customerEmail: 'buyer@example.com',
      items: [
        { id: 'i-1', productId: 'p-1', quantity: 2, unitPriceInCents: 1000 },
        { id: 'i-2', productId: 'p-2', quantity: 1, unitPriceInCents: 500 },
      ],
    });
    transaction.markApproved({
      gatewayTransactionId: 'gw-1',
      cardLastFour: '4242',
      cardBrand: 'VISA',
    });

    const orm = TransactionMapper.toOrm(transaction);
    const roundTripped = TransactionMapper.toDomain(orm);

    expect(roundTripped.toProps()).toEqual(transaction.toProps());
  });
});
