export const WEBHOOK_SIGNATURE_VERIFIER = Symbol('WEBHOOK_SIGNATURE_VERIFIER');

/**
 * The gateway embeds its webhook checksum inside the JSON body itself
 * (`signature.checksum`), not in an HTTP header, so the verifier takes the parsed payload.
 */
export interface WebhookSignatureVerifierPort {
  verify(payload: Record<string, unknown>): boolean;
}
