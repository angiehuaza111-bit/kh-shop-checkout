import { Repository } from 'typeorm';
import { WebhookEvent } from '../../domain/webhook-event.entity';
import { WebhookEventMapper } from './webhook-event.mapper';
import { WebhookEventOrmEntity } from './webhook-event.orm-entity';
import { WebhookEventRepository } from './webhook-event.repository';

function buildEvent(): WebhookEvent {
  return WebhookEvent.create({
    id: 'e-1',
    providerEventId: 'evt-1',
    payload: {},
    signatureValid: true,
  });
}

describe('WebhookEventRepository', () => {
  let typeOrmRepository: jest.Mocked<Repository<WebhookEventOrmEntity>>;
  let repository: WebhookEventRepository;

  beforeEach(() => {
    typeOrmRepository = {
      count: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<WebhookEventOrmEntity>>;
    repository = new WebhookEventRepository(typeOrmRepository);
  });

  it('existsByProviderEventId returns true when at least one row matches', async () => {
    typeOrmRepository.count.mockResolvedValue(1);

    expect(await repository.existsByProviderEventId('evt-1')).toBe(true);
  });

  it('existsByProviderEventId returns false when no row matches', async () => {
    typeOrmRepository.count.mockResolvedValue(0);

    expect(await repository.existsByProviderEventId('missing')).toBe(false);
  });

  it('create persists and returns the mapped domain event', async () => {
    typeOrmRepository.save.mockResolvedValue(WebhookEventMapper.toOrm(buildEvent()));

    const result = await repository.create(buildEvent());

    expect(result.providerEventId).toBe('evt-1');
  });

  it('update persists and returns the mapped domain event', async () => {
    const event = buildEvent();
    event.markProcessed();
    typeOrmRepository.save.mockResolvedValue(WebhookEventMapper.toOrm(event));

    const result = await repository.update(event);

    expect(result.toProps().processedAt).toBeInstanceOf(Date);
  });
});
