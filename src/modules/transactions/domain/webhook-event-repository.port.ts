import { WebhookEvent } from './webhook-event.entity';

export const WEBHOOK_EVENT_REPOSITORY = Symbol('WEBHOOK_EVENT_REPOSITORY');

export interface WebhookEventRepositoryPort {
  existsByProviderEventId(providerEventId: string): Promise<boolean>;
  create(event: WebhookEvent): Promise<WebhookEvent>;
  update(event: WebhookEvent): Promise<WebhookEvent>;
}
