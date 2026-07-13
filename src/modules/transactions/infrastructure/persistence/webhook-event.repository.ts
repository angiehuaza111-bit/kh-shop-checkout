import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEventRepositoryPort } from '../../domain/webhook-event-repository.port';
import { WebhookEvent } from '../../domain/webhook-event.entity';
import { WebhookEventMapper } from './webhook-event.mapper';
import { WebhookEventOrmEntity } from './webhook-event.orm-entity';

@Injectable()
export class WebhookEventRepository implements WebhookEventRepositoryPort {
  constructor(
    @InjectRepository(WebhookEventOrmEntity)
    private readonly repository: Repository<WebhookEventOrmEntity>,
  ) {}

  async existsByProviderEventId(providerEventId: string): Promise<boolean> {
    const count = await this.repository.count({ where: { providerEventId } });
    return count > 0;
  }

  async create(event: WebhookEvent): Promise<WebhookEvent> {
    const orm = await this.repository.save(WebhookEventMapper.toOrm(event));
    return WebhookEventMapper.toDomain(orm);
  }

  async update(event: WebhookEvent): Promise<WebhookEvent> {
    const orm = await this.repository.save(WebhookEventMapper.toOrm(event));
    return WebhookEventMapper.toDomain(orm);
  }
}
