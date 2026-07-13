import { ValidationDomainError } from '../../../../common/domain/domain-error';
import { WebhookPayloadMapper } from './webhook-payload.mapper';

describe('WebhookPayloadMapper', () => {
  it('maps an approved transaction payload to a notification', () => {
    const notification = WebhookPayloadMapper.toNotification({
      event: 'transaction.updated',
      timestamp: 1700000000,
      data: {
        transaction: {
          id: 'gw-1',
          reference: 'REF-1',
          status: 'APPROVED',
          payment_method: { extra: { last_four: '4242', brand: 'VISA' } },
        },
      },
    });

    expect(notification).toMatchObject({
      providerEventId: 'gw-1:1700000000',
      reference: 'REF-1',
      status: 'APPROVED',
      cardLastFour: '4242',
      cardBrand: 'VISA',
      failureReason: null,
    });
  });

  it('maps a non-approved status to DECLINED with a failure reason', () => {
    const notification = WebhookPayloadMapper.toNotification({
      data: {
        transaction: {
          id: 'gw-2',
          reference: 'REF-2',
          status: 'DECLINED',
          status_message: 'Insufficient funds',
        },
      },
    });

    expect(notification.status).toBe('DECLINED');
    expect(notification.failureReason).toBe('Insufficient funds');
  });

  it('throws ValidationDomainError when the transaction reference is missing', () => {
    expect(() =>
      WebhookPayloadMapper.toNotification({ data: { transaction: { status: 'APPROVED' } } }),
    ).toThrow(ValidationDomainError);
  });

  it('throws ValidationDomainError when the payload has no transaction at all', () => {
    expect(() => WebhookPayloadMapper.toNotification({})).toThrow(ValidationDomainError);
  });
});
