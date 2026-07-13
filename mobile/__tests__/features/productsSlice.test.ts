import { configureStore } from '@reduxjs/toolkit';
import { fetchProducts, Product, productsReducer } from '../../src/features/products/productsSlice';

function buildStore() {
  return configureStore({ reducer: { products: productsReducer } });
}

describe('productsSlice', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('loads products successfully', async () => {
    const products: Product[] = [
      {
        id: 'p-1',
        name: 'Mouse',
        description: null,
        priceInCents: 1000,
        currency: 'COP',
        stock: 5,
        imageUrl: null,
        isActive: true,
      },
    ];
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(products),
    }) as unknown as typeof fetch;

    const store = buildStore();
    await store.dispatch(fetchProducts());

    const state = store.getState().products;
    expect(state.status).toBe('succeeded');
    expect(state.items).toEqual(products);
  });

  it('sets status to loading while the request is in flight', () => {
    globalThis.fetch = jest.fn(() => new Promise(() => undefined)) as unknown as typeof fetch;

    const store = buildStore();
    void store.dispatch(fetchProducts());

    expect(store.getState().products.status).toBe('loading');
  });

  it('records an error when the response is not ok', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const store = buildStore();
    await store.dispatch(fetchProducts());

    const state = store.getState().products;
    expect(state.status).toBe('failed');
    expect(state.error).toContain('500');
  });
});
