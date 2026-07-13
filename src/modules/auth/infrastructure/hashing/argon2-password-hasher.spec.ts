import * as argon2 from 'argon2';
import { Argon2PasswordHasher } from './argon2-password-hasher';

jest.mock('argon2');

describe('Argon2PasswordHasher', () => {
  let hasher: Argon2PasswordHasher;

  beforeEach(() => {
    hasher = new Argon2PasswordHasher();
    jest.clearAllMocks();
  });

  it('delegates hashing to argon2.hash', async () => {
    (argon2.hash as jest.Mock).mockResolvedValue('hashed-value');

    const result = await hasher.hash('plain-password');

    expect(result).toBe('hashed-value');
    expect(argon2.hash).toHaveBeenCalledWith('plain-password');
  });

  it('delegates comparison to argon2.verify with (hash, plain) order', async () => {
    (argon2.verify as jest.Mock).mockResolvedValue(true);

    const result = await hasher.compare('plain-password', 'hashed-value');

    expect(result).toBe(true);
    expect(argon2.verify).toHaveBeenCalledWith('hashed-value', 'plain-password');
  });
});
