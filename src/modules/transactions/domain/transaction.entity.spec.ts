import { ConflictDomainError, ValidationDomainError } from '../../../common/domain/domain-error';
import { Transaction } from './transaction.entity';
import { TransactionStatus } from './transaction-status.enum';

function buildTransaction(): Transaction {
  return Transaction.create({
    id: 't-1',
    reference: 'REF-1',
    currency: 'COP',
    customerEmail: 'buyer@example.com',
    items: [
      { id: 'i-1', productId: 'p-1', quantity: 2, unitPriceInCents: 1000 },
      { id: 'i-2', productId: 'p-2', quantity: 1, unitPriceInCents: 500 },
    ],
  });
}

describe('Transaction', () => {
  describe('create', () => {
    it('computes the total amount and subtotals from the items', () => {
      const transaction = buildTransaction();

      expect(transaction.amountInCents).toBe(2500);
      expect(transaction.items[0].subtotalInCents).toBe(2000);
      expect(transaction.items[1].subtotalInCents).toBe(500);
      expect(transaction.status).toBe(TransactionStatus.PENDING);
    });

    it('throws ValidationDomainError when there are no items', () => {
      expect(() =>
        Transaction.create({
          id: 't-1',
          reference: 'REF-1',
          currency: 'COP',
          customerEmail: 'buyer@example.com',
          items: [],
        }),
      ).toThrow(ValidationDomainError);
    });

    it('throws ValidationDomainError when the customer email is empty', () => {
      expect(() =>
        Transaction.create({
          id: 't-1',
          reference: 'REF-1',
          currency: 'COP',
          customerEmail: '  ',
          items: [{ id: 'i-1', productId: 'p-1', quantity: 1, unitPriceInCents: 100 }],
        }),
      ).toThrow(ValidationDomainError);
    });

    it('throws ValidationDomainError when an item quantity is not positive', () => {
      expect(() =>
        Transaction.create({
          id: 't-1',
          reference: 'REF-1',
          currency: 'COP',
          customerEmail: 'buyer@example.com',
          items: [{ id: 'i-1', productId: 'p-1', quantity: 0, unitPriceInCents: 100 }],
        }),
      ).toThrow(ValidationDomainError);
    });
  });

  describe('isPending', () => {
    it('returns true right after creation', () => {
      expect(buildTransaction().isPending()).toBe(true);
    });
  });

  describe('attachGatewayReference', () => {
    it('stores the gateway transaction id without changing the status', () => {
      const transaction = buildTransaction();

      transaction.attachGatewayReference('gw-123');

      expect(transaction.gatewayTransactionId).toBe('gw-123');
      expect(transaction.status).toBe(TransactionStatus.PENDING);
    });
  });

  describe('markApproved', () => {
    it('resolves the transaction as approved with card details', () => {
      const transaction = buildTransaction();

      transaction.markApproved({
        gatewayTransactionId: 'gw-123',
        cardLastFour: '4242',
        cardBrand: 'VISA',
      });

      expect(transaction.status).toBe(TransactionStatus.APPROVED);
      expect(transaction.cardLastFour).toBe('4242');
      expect(transaction.cardBrand).toBe('VISA');
    });

    it('throws ConflictDomainError when the transaction is already resolved', () => {
      const transaction = buildTransaction();
      transaction.markApproved({
        gatewayTransactionId: 'gw-1',
        cardLastFour: null,
        cardBrand: null,
      });

      expect(() =>
        transaction.markApproved({
          gatewayTransactionId: 'gw-2',
          cardLastFour: null,
          cardBrand: null,
        }),
      ).toThrow(ConflictDomainError);
    });
  });

  describe('markDeclined', () => {
    it('resolves the transaction as declined with a failure reason', () => {
      const transaction = buildTransaction();

      transaction.markDeclined({
        gatewayTransactionId: 'gw-1',
        failureReason: 'Insufficient funds',
      });

      expect(transaction.status).toBe(TransactionStatus.DECLINED);
      expect(transaction.failureReason).toBe('Insufficient funds');
    });

    it('throws ConflictDomainError when the transaction is already resolved', () => {
      const transaction = buildTransaction();
      transaction.markDeclined({ gatewayTransactionId: 'gw-1', failureReason: 'reason' });

      expect(() =>
        transaction.markDeclined({ gatewayTransactionId: 'gw-2', failureReason: 'reason 2' }),
      ).toThrow(ConflictDomainError);
    });
  });

  describe('markError', () => {
    it('resolves the transaction as error with a failure reason', () => {
      const transaction = buildTransaction();

      transaction.markError('Gateway timed out');

      expect(transaction.status).toBe(TransactionStatus.ERROR);
      expect(transaction.failureReason).toBe('Gateway timed out');
    });

    it('throws ConflictDomainError when the transaction is already resolved', () => {
      const transaction = buildTransaction();
      transaction.markError('first failure');

      expect(() => transaction.markError('second failure')).toThrow(ConflictDomainError);
    });
  });

  describe('toProps', () => {
    it('returns a deep copy of the items array', () => {
      const transaction = buildTransaction();

      const props = transaction.toProps();
      props.items[0].quantity = 999;

      expect(transaction.items[0].quantity).toBe(2);
    });
  });
});
