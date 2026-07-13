import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/env';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;
  currency: string;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  /** Optional, not exposed by the backend today — UI renders these only when present. */
  category?: string | null;
  discountPercentage?: number | null;
  rating?: number | null;
}

export interface ProductsState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk<Product[]>('products/fetch', async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) {
    throw new Error(`Error al cargar productos (estado ${response.status})`);
  }
  return (await response.json()) as Product[];
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Error al cargar productos';
      });
  },
});

export const productsReducer = productsSlice.reducer;
