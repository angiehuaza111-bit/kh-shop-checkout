import { decryptFromStorage, encryptForStorage } from '../../src/utils/encryption';

describe('encryptForStorage / decryptFromStorage', () => {
  it('round-trips an object through encryption and decryption', () => {
    const value = { id: 't-1', status: 'APPROVED', amountInCents: 1000 };

    const ciphertext = encryptForStorage(value);
    const decrypted = decryptFromStorage<typeof value>(ciphertext);

    expect(decrypted).toEqual(value);
  });

  it('does not store the plaintext value in the ciphertext', () => {
    const ciphertext = encryptForStorage({ secret: 'super-secret-value' });

    expect(ciphertext).not.toContain('super-secret-value');
  });

  it('returns null for garbage ciphertext instead of throwing', () => {
    expect(decryptFromStorage('not-valid-ciphertext')).toBeNull();
  });

  it('returns null when decryption succeeds but yields empty content', () => {
    expect(decryptFromStorage('')).toBeNull();
  });
});
