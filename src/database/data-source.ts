import 'dotenv/config';
import { DataSource } from 'typeorm';

// Loaded directly by the TypeORM CLI (migration:generate/run/revert), outside of the
// Nest DI context, so environment variables are read from process.env as-is.
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value; //NOSONAR false positive: value comes from process.env
}

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number.parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: requireEnv('DATABASE_USER'),
  password: requireEnv('DATABASE_PASSWORD'),
  database: process.env.DATABASE_NAME ?? 'checkout_db',
  ssl: process.env.DATABASE_SSL === 'true',
  entities: [__dirname + '/../**/*.orm-entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});

export default dataSource;
