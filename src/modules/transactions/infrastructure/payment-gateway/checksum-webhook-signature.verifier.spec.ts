import { createHash } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '../../../../config/configuration';
import { ChecksumWebhookSignatureVerifier } from './checksum-webhook-signature.verifier';

const EVENTS_KEY = 'events-secret';

function buildVerifier(eventsKey: string | null = EVENTS_KEY): ChecksumWebhookSignatureVerifier {
  const configService = {
    get: jest.fn().mockReturnValue({ eventsKey: eventsKey ?? '' }),
  } as unknown as ConfigService<Configuration, true>;
  return new ChecksumWebhookSignatureVerifier(configService);
}

function buildSignedPayload(overrides: { eventsKey?: string; tamperedChecksum?: string } = {}) {
  const timestamp = 1700000000;
  const transaction = { id: 'gw-1', status: 'APPROVED', reference: 'REF-1' };
  const properties = ['transaction.id', 'transaction.status', 'transaction.reference'];
  const concatenated = properties
    .map((path) => transaction[path.split('.')[1] as keyof typeof transaction])
    .join('');
  const checksum = createHash('sha256')
    .update(`${concatenated}${timestamp}${overrides.eventsKey ?? EVENTS_KEY}`)
    .digest('hex');

  return {
    timestamp,
    data: { transaction },
    signature: { properties, checksum: overrides.tamperedChecksum ?? checksum },
  };
}

describe('ChecksumWebhookSignatureVerifier', () => {
  it('accepts a payload whose checksum matches the configured events key', () => {
    const verifier = buildVerifier();

    expect(verifier.verify(buildSignedPayload())).toBe(true);
  });

  it('rejects a payload signed with a different events key', () => {
    const verifier = buildVerifier();

    expect(verifier.verify(buildSignedPayload({ eventsKey: 'wrong-secret' }))).toBe(false);
  });

  it('rejects a tampered checksum', () => {
    const verifier = buildVerifier();

    expect(verifier.verify(buildSignedPayload({ tamperedChecksum: 'a'.repeat(64) }))).toBe(false);
  });

  it('rejects when no events key is configured', () => {
    const verifier = buildVerifier(null);

    expect(verifier.verify(buildSignedPayload())).toBe(false);
  });

  it('rejects when the payload has no signature block', () => {
    const verifier = buildVerifier();

    expect(verifier.verify({ data: {} })).toBe(false);
  });

  it('rejects when the payload has no timestamp', () => {
    const verifier = buildVerifier();
    const payload = buildSignedPayload();
    delete (payload as { timestamp?: number }).timestamp;

    expect(verifier.verify(payload)).toBe(false);
  });

  it('rejects a checksum of a different length without throwing', () => {
    const verifier = buildVerifier();

    expect(verifier.verify(buildSignedPayload({ tamperedChecksum: 'ab' }))).toBe(false);
  });
});
