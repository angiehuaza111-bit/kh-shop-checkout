import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HandlePaymentWebhookUseCase } from '../application/use-cases/handle-payment-webhook.use-case';
import {
  RawWebhookPayload,
  WebhookPayloadMapper,
} from '../infrastructure/payment-gateway/webhook-payload.mapper';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly handlePaymentWebhookUseCase: HandlePaymentWebhookUseCase) {}

  @Post('payments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive asynchronous payment status notifications from the gateway' })
  async handle(@Body() body: RawWebhookPayload): Promise<void> {
    const notification = WebhookPayloadMapper.toNotification(body);
    await this.handlePaymentWebhookUseCase.execute({
      rawPayload: body as unknown as Record<string, unknown>,
      notification,
    });
  }
}
