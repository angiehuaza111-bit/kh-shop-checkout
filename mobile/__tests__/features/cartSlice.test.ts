import {
  addProduct,
  cartReducer,
  CartState,
  clearCart,
  decrementItem,
  incrementItem,
  removeItem,
  selectCartItemCount,
  selectCartTotalInCents,
} from '../../src/features/cart/cartSlice';
import { Product } from '../../src/features/products/productsSlice';

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p-1',
    name: 'Mouse',
    description: null,
    priceInCents: 1000,
    currency: 'COP',
    stock: 5,
    imageUrl: null,
    isActive: true,
    ...overrides,
  };
}

describe('cartSlice', () => {
  const initialState: CartState = { items: [] };

  it('adds a new product to an empty cart', () => {
    const state = cartReducer(initialState, addProduct(buildProduct()));

    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ productId: 'p-1', quantity: 1 });
  });

  it('increments the quantity when adding an already-present product', () => {
    let state = cartReducer(initialState, addProduct(buildProduct()));
    state = cartReducer(state, addProduct(buildProduct()));

    expect(state.items[0].quantity).toBe(2);
  });

  it('increments an item quantity directly', () => {
    let state = cartReducer(initialState, addProduct(buildProduct()));
    state = cartReducer(state, incrementItem('p-1'));

    expect(state.items[0].quantity).toBe(2);
  });

  it('decrements an item quantity, removing it once it reaches zero', () => {
    let state = cartReducer(initialState, addProduct(buildProduct()));
    state = cartReducer(state, decrementItem('p-1'));

    expect(state.items).toHaveLength(0);
  });

  it('decrementing a missing item is a no-op', () => {
    const state = cartReducer(initialState, decrementItem('missing'));

    expect(state.items).toHaveLength(0);
  });

  it('removes an item explicitly', () => {
    let state = cartReducer(initialState, addProduct(buildProduct()));
    state = cartReducer(state, removeItem('p-1'));

    expect(state.items).toHaveLength(0);
  });

  it('clears the entire cart', () => {
    let state = cartReducer(initialState, addProduct(buildProduct()));
    state = cartReducer(state, addProduct(buildProduct({ id: 'p-2' })));
    state = cartReducer(state, clearCart());

    expect(state.items).toHaveLength(0);
  });

  describe('selectors', () => {
    const items = [
      { productId: 'p-1', name: 'Mouse', priceInCents: 1000, currency: 'COP', quantity: 2 },
      { productId: 'p-2', name: 'Keyboard', priceInCents: 2000, currency: 'COP', quantity: 1 },
    ];

    it('selectCartTotalInCents sums subtotals', () => {
      expect(selectCartTotalInCents(items)).toBe(4000);
    });

    it('selectCartItemCount sums quantities', () => {
      expect(selectCartItemCount(items)).toBe(3);
    });
  });
});
