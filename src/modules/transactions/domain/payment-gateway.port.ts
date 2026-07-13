export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export type GatewayChargeStatus = 'APPROVED' | 'DECLINED' | 'PENDING';

export interface ChargeCardCommand {
  reference: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  cardToken: string;
  installments: number;
}

export interface ChargeResult {
  gatewayTransactionId: string;
  status: GatewayChargeStatus;
  cardLastFour: string | null;
  cardBrand: string | null;
  failureReason: string | null;
}

export interface PaymentGatewayPort {
  chargeCard(command: ChargeCardCommand): Promise<ChargeResult>;
  checkStatus(gatewayTransactionId: string): Promise<ChargeResult>;
}
