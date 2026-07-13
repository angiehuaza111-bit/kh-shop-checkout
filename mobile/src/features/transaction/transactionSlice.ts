import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/env';
import { CartItem } from '../cart/cartSlice';

export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface TransactionItem {
  productId: string;
  quantity: number;
  unitPriceInCents: number;
  subtotalInCents: number;
}

export interface Transaction {
  id: string;
  reference: string;
  status: TransactionStatus;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  cardLastFour: string | null;
  cardBrand: string | null;
  failureReason: string | null;
  items: TransactionItem[];
  createdAt: string;
}

export interface CreateTransactionArgs {
  items: CartItem[];
  customerEmail: string;
  cardToken: string;
  installments?: number;
}

export interface TransactionState {
  current: Transaction | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TransactionState = {
  current: null,
  status: 'idle',
  error: null,
};

export const fetchTransactionStatus = createAsyncThunk<Transaction, string>(
  'transaction/fetchStatus',
  async (transactionId) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`);
    const body = (await response.json()) as Transaction;
    if (!response.ok) {
      throw new Error('No se pudo consultar el estado de la transacción');
    }
    return body;
  },
);

export const createTransaction = createAsyncThunk<Transaction, CreateTransactionArgs>(
  'transaction/create',
  async (args) => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: args.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        customerEmail: args.customerEmail,
        cardToken: args.cardToken,
        installments: args.installments ?? 1,
      }),
    });

    const body = (await response.json()) as Transaction & { message?: string };
    if (!response.ok) {
      throw new Error(body.message ?? 'El pago no pudo ser procesado');
    }
    return body;
  },
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    resetTransaction: (state) => {
      state.current = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTransaction.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'El pago no pudo ser procesado';
      })
      .addCase(fetchTransactionStatus.fulfilled, (state, action: PayloadAction<Transaction>) => {
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      });
  },
});

export const { resetTransaction } = transactionSlice.actions;
export const transactionReducer = transactionSlice.reducer;
