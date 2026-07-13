import { WebhookEvent } from '../../domain/webhook-event.entity';
import { WebhookEventOrmEntity } from './webhook-event.orm-entity';

export class WebhookEventMapper {
  static toDomain(orm: WebhookEventOrmEntity): WebhookEvent {
    return WebhookEvent.fromPersistence({
      id: orm.id,
      providerEventId: orm.providerEventId,
      payload: orm.payload,
      signatureValid: orm.signatureValid,
      processedAt: orm.processedAt,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(event: WebhookEvent): WebhookEventOrmEntity {
    const props = event.toProps();
    const orm = new WebhookEventOrmEntity();
    orm.id = props.id;
    orm.providerEventId = props.providerEventId;
    orm.payload = props.payload;
    orm.signatureValid = props.signatureValid;
    orm.processedAt = props.processedAt;
    orm.createdAt = props.createdAt;
    return orm;
  }
}
