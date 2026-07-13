import { HandlePaymentWebhookUseCase } from '../application/use-cases/handle-payment-webhook.use-case';
import { WebhooksController } from './webhooks.controller';

describe('WebhooksController', () => {
  it('parses the payload and forwards it along with the raw parsed body', async () => {
    const handlePaymentWebhookUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<HandlePaymentWebhookUseCase>;
    const controller = new WebhooksController(handlePaymentWebhookUseCase);
    const payload = {
      timestamp: 123,
      data: { transaction: { id: 'gw-1', reference: 'REF-1', status: 'APPROVED' } },
    };

    await controller.handle(payload);

    expect(handlePaymentWebhookUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        rawPayload: payload,
        notification: expect.objectContaining({ reference: 'REF-1', status: 'APPROVED' }),
      }),
    );
  });
});
