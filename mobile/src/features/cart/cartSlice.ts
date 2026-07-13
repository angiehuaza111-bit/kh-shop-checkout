import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../products/productsSlice';

export interface CartItem {
  productId: string;
  name: string;
  priceInCents: number;
  currency: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = { items: [] };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const existing = state.items.find((item) => item.productId === product.id);
      if (existing) {
        existing.quantity += 1;
        return;
      }
      state.items.push({
        productId: product.id,
        name: product.name,
        priceInCents: product.priceInCents,
        currency: product.currency,
        quantity: 1,
      });
    },
    incrementItem: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.productId === action.payload);
      if (item) {
        item.quantity += 1;
      }
    },
    decrementItem: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.productId === action.payload);
      if (!item) {
        return;
      }
      if (item.quantity <= 1) {
        state.items = state.items.filter((i) => i.productId !== action.payload);
        return;
      }
      item.quantity -= 1;
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addProduct, incrementItem, decrementItem, removeItem, clearCart } =
  cartSlice.actions;
export const cartReducer = cartSlice.reducer;

export function selectCartTotalInCents(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.priceInCents * item.quantity, 0);
}

export function selectCartItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}
