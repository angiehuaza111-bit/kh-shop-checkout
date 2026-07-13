import { Transform, plainToInstance } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

const toInt = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? Number.parseInt(value, 10) : value;

class EnvironmentVariables {
  @IsIn([Environment.Development, Environment.Test, Environment.Production])
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @Transform(toInt)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 3000;

  @IsString()
  DATABASE_HOST!: string;

  @Transform(toInt)
  @IsInt()
  DATABASE_PORT!: number;

  @IsString()
  DATABASE_USER!: string;

  @IsString()
  DATABASE_PASSWORD!: string;

  @IsString()
  DATABASE_NAME!: string;

  @IsString()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  JWT_ACCESS_EXPIRES_IN = '15m';

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN = '7d';

  @IsString()
  PAYMENT_API_URL!: string;

  @IsString()
  @IsOptional()
  PAYMENT_PUBLIC_KEY = '';

  @IsString()
  @IsOptional()
  PAYMENT_PRIVATE_KEY = '';

  @IsString()
  @IsOptional()
  PAYMENT_EVENTS_KEY = '';

  @IsString()
  @IsOptional()
  PAYMENT_INTEGRITY_KEY = '';
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    const messages = errors.map((error) => Object.values(error.constraints ?? {}).join(', '));
    throw new Error(`Invalid environment configuration:\n${messages.join('\n')}`);
  }

  return validatedConfig;
}
