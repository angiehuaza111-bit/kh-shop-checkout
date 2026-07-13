import { WebhookEvent } from './webhook-event.entity';

describe('WebhookEvent', () => {
  it('creates an unprocessed event with the given props', () => {
    const event = WebhookEvent.create({
      id: 'e-1',
      providerEventId: 'evt-123',
      payload: { foo: 'bar' },
      signatureValid: true,
    });

    expect(event.providerEventId).toBe('evt-123');
    expect(event.signatureValid).toBe(true);
    expect(event.toProps().processedAt).toBeNull();
  });

  it('marks the event as processed', () => {
    const event = WebhookEvent.create({
      id: 'e-1',
      providerEventId: 'evt-123',
      payload: {},
      signatureValid: true,
    });

    event.markProcessed();

    expect(event.toProps().processedAt).toBeInstanceOf(Date);
  });

  it('rehydrates from persisted props', () => {
    const now = new Date();
    const event = WebhookEvent.fromPersistence({
      id: 'e-1',
      providerEventId: 'evt-123',
      payload: {},
      signatureValid: false,
      processedAt: now,
      createdAt: now,
    });

    expect(event.signatureValid).toBe(false);
  });
});
