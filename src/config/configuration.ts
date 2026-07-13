export interface AppConfig {
  port: number;
  nodeEnv: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
}

export interface JwtConfig {
  accessSecret: string;
  accessExpiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export interface ThrottleConfig {
  ttlMs: number;
  limit: number;
  loginTtlMs: number;
  loginLimit: number;
}

export interface PaymentGatewayConfig {
  apiUrl: string;
  publicKey: string;
  privateKey: string;
  eventsKey: string;
  integrityKey: string;
}

export interface AdminSeedConfig {
  email: string;
  password: string;
}

export interface ReconciliationConfig {
  pendingIntervalMs: number;
}

export interface Configuration {
  app: AppConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
  throttle: ThrottleConfig;
  payment: PaymentGatewayConfig;
  adminSeed: AdminSeedConfig;
  reconciliation: ReconciliationConfig;
}

function buildAppConfig(): AppConfig {
  return {
    port: Number.parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
  };
}

function buildDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number.parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USER ?? 'checkout_user',
    password: process.env.DATABASE_PASSWORD ?? '',
    database: process.env.DATABASE_NAME ?? 'checkout_db',
    ssl: process.env.DATABASE_SSL === 'true',
  };
}

function buildJwtConfig(): JwtConfig {
  return {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  };
}

function buildThrottleConfig(): ThrottleConfig {
  return {
    ttlMs: Number.parseInt(process.env.THROTTLE_TTL_MS ?? '60000', 10),
    limit: Number.parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
    loginTtlMs: Number.parseInt(process.env.THROTTLE_LOGIN_TTL_MS ?? '60000', 10),
    loginLimit: Number.parseInt(process.env.THROTTLE_LOGIN_LIMIT ?? '5', 10),
  };
}

function buildPaymentConfig(): PaymentGatewayConfig {
  return {
    apiUrl: process.env.PAYMENT_API_URL ?? '',
    publicKey: process.env.PAYMENT_PUBLIC_KEY ?? '',
    privateKey: process.env.PAYMENT_PRIVATE_KEY ?? '',
    eventsKey: process.env.PAYMENT_EVENTS_KEY ?? '',
    integrityKey: process.env.PAYMENT_INTEGRITY_KEY ?? '',
  };
}

function buildAdminSeedConfig(): AdminSeedConfig {
  return {
    email: process.env.ADMIN_SEED_EMAIL ?? '',
    password: process.env.ADMIN_SEED_PASSWORD ?? '',
  };
}

function buildReconciliationConfig(): ReconciliationConfig {
  return {
    pendingIntervalMs: Number.parseInt(process.env.RECONCILE_PENDING_INTERVAL_MS ?? '60000', 10),
  };
}

function buildConfiguration(): Configuration {
  return {
    app: buildAppConfig(),
    database: buildDatabaseConfig(),
    jwt: buildJwtConfig(),
    throttle: buildThrottleConfig(),
    payment: buildPaymentConfig(),
    adminSeed: buildAdminSeedConfig(),
    reconciliation: buildReconciliationConfig(),
  };
}

export default buildConfiguration;
