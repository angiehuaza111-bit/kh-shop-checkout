import AsyncStorage from '@react-native-async-storage/async-storage';
import { decryptFromStorage, encryptForStorage } from '../utils/encryption';
import { Transaction } from '../features/transaction/transactionSlice';

const TRANSACTION_STORAGE_KEY = 'checkout-mobile:last-transaction';

export async function persistTransaction(transaction: Transaction): Promise<void> {
  await AsyncStorage.setItem(TRANSACTION_STORAGE_KEY, encryptForStorage(transaction));
}

export async function loadPersistedTransaction(): Promise<Transaction | null> {
  const ciphertext = await AsyncStorage.getItem(TRANSACTION_STORAGE_KEY);
  if (!ciphertext) {
    return null;
  }
  return decryptFromStorage<Transaction>(ciphertext);
}

export async function clearPersistedTransaction(): Promise<void> {
  await AsyncStorage.removeItem(TRANSACTION_STORAGE_KEY);
}
