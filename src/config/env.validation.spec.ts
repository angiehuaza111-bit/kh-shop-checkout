import { validateEnv } from './env.validation';

function validEnv(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    NODE_ENV: 'test',
    PORT: '3000',
    DATABASE_HOST: 'localhost',
    DATABASE_PORT: '5432',
    DATABASE_USER: 'user',
    DATABASE_PASSWORD: 'password',
    DATABASE_NAME: 'db',
    JWT_ACCESS_SECRET: 'access-secret',
    JWT_REFRESH_SECRET: 'refresh-secret',
    PAYMENT_API_URL: 'https://example.dev/v1',
    ...overrides,
  };
}

describe('validateEnv', () => {
  it('returns a validated config instance when all required variables are present', () => {
    const result = validateEnv(validEnv());

    expect(result.DATABASE_HOST).toBe('localhost');
    expect(result.PORT).toBe(3000);
  });

  it('applies defaults for optional variables', () => {
    const result = validateEnv(validEnv());

    expect(result.JWT_ACCESS_EXPIRES_IN).toBe('15m');
    expect(result.JWT_REFRESH_EXPIRES_IN).toBe('7d');
  });

  it('throws when a required variable is missing', () => {
    const env = validEnv();
    delete env.DATABASE_HOST;

    expect(() => validateEnv(env)).toThrow(/Invalid environment configuration/);
  });

  it('throws when PORT is out of range', () => {
    expect(() => validateEnv(validEnv({ PORT: '99999' }))).toThrow();
  });

  it('throws when NODE_ENV is not one of the allowed values', () => {
    expect(() => validateEnv(validEnv({ NODE_ENV: 'staging' }))).toThrow();
  });
});
