import { createHash, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '../../../../config/configuration';
import { WebhookSignatureVerifierPort } from '../../domain/webhook-signature-verifier.port';
import { RawWebhookPayload } from './webhook-payload.mapper';

/**
 * The gateway signs webhook events as `checksum = SHA256(propertyValues + timestamp + eventsSecret)`,
 * where `propertyValues` is the concatenation of the values found at each dot-path listed in
 * `signature.properties` (e.g. "transaction.id", "transaction.status"), resolved against `data`.
 * This mirrors the same checksum style used for the transaction-creation integrity signature.
 */
@Injectable()
export class ChecksumWebhookSignatureVerifier implements WebhookSignatureVerifierPort {
  constructor(private readonly configService: ConfigService<Configuration, true>) {}

  verify(payload: Record<string, unknown>): boolean {
    const raw = payload as RawWebhookPayload;
    const eventsKey = this.configService.get('payment', { infer: true }).eventsKey;

    if (!eventsKey || !raw.signature?.checksum || !raw.signature.properties?.length) {
      return false;
    }
    if (raw.timestamp === undefined) {
      return false;
    }

    const expected = this.computeChecksum(raw, eventsKey);
    return this.matches(expected, raw.signature.checksum);
  }

  private computeChecksum(raw: RawWebhookPayload, eventsKey: string): string {
    const concatenatedValues = (raw.signature?.properties ?? [])
      .map((path) => this.resolvePath(raw.data, path))
      .join('');
    return createHash('sha256')
      .update(`${concatenatedValues}${raw.timestamp}${eventsKey}`)
      .digest('hex');
  }

  private resolvePath(source: unknown, path: string): string {
    const value = path
      .split('.')
      .reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], source);
    if (value === undefined || value === null) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return JSON.stringify(value);
  }

  private matches(expectedHex: string, providedHex: string): boolean {
    const expectedBuffer = Buffer.from(expectedHex.toLowerCase(), 'hex');
    const providedBuffer = Buffer.from(providedHex.toLowerCase(), 'hex');
    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }
    return timingSafeEqual(expectedBuffer, providedBuffer);
  }
}
