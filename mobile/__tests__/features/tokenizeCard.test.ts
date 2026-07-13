import { CardTokenizationError, tokenizeCard } from '../../src/features/paymentGateway/tokenizeCard';

const cardValues = {
  number: '4242 4242 4242 4242',
  cardHolder: 'John Doe',
  expiryMonth: '12',
  expiryYear: '99',
  cvc: '123',
};

describe('tokenizeCard', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns the token id on a successful response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: 'tok_123' } }),
    }) as unknown as typeof fetch;

    const token = await tokenizeCard(cardValues);

    expect(token).toBe('tok_123');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/tokens/cards'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"number":"4242424242424242"'),
      }),
    );
  });

  it('throws CardTokenizationError when the response is not ok', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: false, status: 422, json: () => Promise.resolve({ error: { messages: { number: ['Card rejected'] } } }) }) as unknown as typeof fetch;

    await expect(tokenizeCard(cardValues)).rejects.toThrow(CardTokenizationError);
  });

  it('throws CardTokenizationError when the network call fails', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;

    await expect(tokenizeCard(cardValues)).rejects.toThrow(CardTokenizationError);
  });
});
