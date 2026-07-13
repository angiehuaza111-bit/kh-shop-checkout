import configuration from './configuration';

describe('configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('builds a typed configuration object from environment variables', () => {
    process.env.PORT = '4000';
    process.env.DATABASE_HOST = 'db-host';
    process.env.DATABASE_PORT = '5433';
    process.env.DATABASE_SSL = 'true';
    process.env.RECONCILE_PENDING_INTERVAL_MS = '30000';

    const config = configuration();

    expect(config.app.port).toBe(4000);
    expect(config.database.host).toBe('db-host');
    expect(config.database.port).toBe(5433);
    expect(config.database.ssl).toBe(true);
    expect(config.reconciliation.pendingIntervalMs).toBe(30000);
  });

  it('falls back to sane defaults when variables are not set', () => {
    delete process.env.PORT;
    delete process.env.DATABASE_HOST;
    delete process.env.JWT_ACCESS_EXPIRES_IN;
    delete process.env.RECONCILE_PENDING_INTERVAL_MS;

    const config = configuration();

    expect(config.app.port).toBe(3000);
    expect(config.database.host).toBe('localhost');
    expect(config.jwt.accessExpiresIn).toBe('15m');
    expect(config.reconciliation.pendingIntervalMs).toBe(60000);
  });
});
