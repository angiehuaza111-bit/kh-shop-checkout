import { createHash } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { ExternalServiceDomainError } from '../../../../common/domain/domain-error';
import { Configuration } from '../../../../config/configuration';
import { CardPaymentGatewayAdapter } from './card-payment-gateway.adapter';

const INTEGRITY_KEY = 'integrity_secret';

function buildAdapter(): CardPaymentGatewayAdapter {
  const configService = {
    get: jest.fn().mockReturnValue({
      apiUrl: 'https://gateway.test/v1',
      publicKey: 'pub_test_key',
      privateKey: 'prv_test_key',
      integrityKey: INTEGRITY_KEY,
    }),
  } as unknown as ConfigService<Configuration, true>;
  return new CardPaymentGatewayAdapter(configService);
}

function expectedSignature(reference: string, amountInCents: number, currency: string): string {
  return createHash('sha256')
    .update(`${reference}${amountInCents}${currency}${INTEGRITY_KEY}`)
    .digest('hex');
}

const acceptanceTokenResponse = {
  ok: true,
  status: 200,
  json: () =>
    Promise.resolve({ data: { presigned_acceptance: { acceptance_token: 'accept_tok_1' } } }),
};

function mockFetchSequence(...responses: unknown[]): void {
  const fn = jest.fn();
  responses.forEach((response) => fn.mockResolvedValueOnce(response));
  global.fetch = fn as unknown as typeof fetch;
}

const baseCommand = {
  reference: 'REF-1',
  amountInCents: 1000,
  currency: 'COP',
  customerEmail: 'buyer@example.com',
  cardToken: 'tok_123',
  installments: 1,
};

describe('CardPaymentGatewayAdapter', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('fetches an acceptance token before charging and maps an approved response', async () => {
    mockFetchSequence(acceptanceTokenResponse, {
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: {
            id: 'gw-1',
            status: 'APPROVED',
            payment_method: { extra: { last_four: '4242', brand: 'VISA' } },
          },
        }),
    });

    const result = await buildAdapter().chargeCard(baseCommand);

    expect(result).toEqual({
      gatewayTransactionId: 'gw-1',
      status: 'APPROVED',
      cardLastFour: '4242',
      cardBrand: 'VISA',
      failureReason: null,
    });
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'https://gateway.test/v1/merchants/pub_test_key',
      expect.objectContaining({ method: 'GET' }),
    );
    const signature = expectedSignature('REF-1', 1000, 'COP');
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'https://gateway.test/v1/transactions',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"acceptance_token":"accept_tok_1"'),
      }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'https://gateway.test/v1/transactions',
      expect.objectContaining({ body: expect.stringContaining(`"signature":"${signature}"`) }),
    );
  });

  it('maps a declined gateway response with a failure reason', async () => {
    mockFetchSequence(acceptanceTokenResponse, {
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: { id: 'gw-2', status: 'DECLINED', status_message: 'Card expired' },
        }),
    });

    const result = await buildAdapter().chargeCard(baseCommand);

    expect(result.status).toBe('DECLINED');
    expect(result.failureReason).toBe('Card expired');
  });

  it('maps an unrecognized status to PENDING', async () => {
    mockFetchSequence(acceptanceTokenResponse, {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { id: 'gw-3', status: 'IN_PROGRESS' } }),
    });

    const result = await buildAdapter().chargeCard(baseCommand);

    expect(result.status).toBe('PENDING');
  });

  it('throws ExternalServiceDomainError when fetching the acceptance token fails', async () => {
    mockFetchSequence({ ok: false, status: 401 });

    await expect(buildAdapter().chargeCard(baseCommand)).rejects.toThrow(
      ExternalServiceDomainError,
    );
  });

  it('throws ExternalServiceDomainError when the transaction HTTP response is not ok', async () => {
    mockFetchSequence(acceptanceTokenResponse, { ok: false, status: 500 });

    await expect(buildAdapter().chargeCard(baseCommand)).rejects.toThrow(
      ExternalServiceDomainError,
    );
  });

  it('throws ExternalServiceDomainError when the network call itself fails', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error('ECONNREFUSED')) as unknown as typeof fetch;

    await expect(buildAdapter().chargeCard(baseCommand)).rejects.toThrow(
      ExternalServiceDomainError,
    );
  });

  describe('checkStatus', () => {
    it('queries the gateway transaction by id and maps the response', async () => {
      mockFetchSequence({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: { id: 'gw-1', status: 'APPROVED' } }),
      });

      const result = await buildAdapter().checkStatus('gw-1');

      expect(result.status).toBe('APPROVED');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://gateway.test/v1/transactions/gw-1',
        expect.objectContaining({
          method: 'GET',
          headers: { Authorization: 'Bearer prv_test_key' },
        }),
      );
    });

    it('throws ExternalServiceDomainError when the HTTP response is not ok', async () => {
      mockFetchSequence({ ok: false, status: 404 });

      await expect(buildAdapter().checkStatus('gw-missing')).rejects.toThrow(
        ExternalServiceDomainError,
      );
    });
  });
});
