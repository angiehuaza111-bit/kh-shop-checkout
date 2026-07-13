import { WebhookEvent } from '../../domain/webhook-event.entity';
import { WebhookEventMapper } from './webhook-event.mapper';

describe('WebhookEventMapper', () => {
  it('maps a domain event to an ORM entity and back without losing data', () => {
    const event = WebhookEvent.create({
      id: 'e-1',
      providerEventId: 'evt-1',
      payload: { foo: 'bar' },
      signatureValid: true,
    });

    const orm = WebhookEventMapper.toOrm(event);
    const roundTripped = WebhookEventMapper.toDomain(orm);

    expect(roundTripped.toProps()).toEqual(event.toProps());
  });
});
