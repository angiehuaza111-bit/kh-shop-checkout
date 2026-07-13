import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'webhook_events' })
export class WebhookEventOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index('idx_webhook_events_provider_event_id', { unique: true })
  @Column({ name: 'provider_event_id', type: 'varchar', length: 100, unique: true })
  providerEventId!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ name: 'signature_valid', type: 'boolean' })
  signatureValid!: boolean;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
