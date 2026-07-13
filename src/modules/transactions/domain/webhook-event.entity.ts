export interface WebhookEventProps {
  id: string;
  providerEventId: string;
  payload: Record<string, unknown>;
  signatureValid: boolean;
  processedAt: Date | null;
  createdAt: Date;
}

export class WebhookEvent {
  private constructor(private readonly props: WebhookEventProps) {}

  static create(props: Omit<WebhookEventProps, 'processedAt' | 'createdAt'>): WebhookEvent {
    return new WebhookEvent({ ...props, processedAt: null, createdAt: new Date() });
  }

  static fromPersistence(props: WebhookEventProps): WebhookEvent {
    return new WebhookEvent(props);
  }

  get providerEventId(): string {
    return this.props.providerEventId;
  }

  get signatureValid(): boolean {
    return this.props.signatureValid;
  }

  markProcessed(): void {
    this.props.processedAt = new Date();
  }

  toProps(): WebhookEventProps {
    return { ...this.props };
  }
}
