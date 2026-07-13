import { ConfigService } from '@nestjs/config';
import { Configuration } from '../../../../config/configuration';
import { Role } from '../../domain/role.enum';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('maps a valid payload to an authenticated user', () => {
    const configService = {
      get: jest.fn().mockReturnValue({ accessSecret: 'secret' }),
    } as unknown as ConfigService<Configuration, true>;
    const strategy = new JwtStrategy(configService);

    const result = strategy.validate({ sub: 'u-1', email: 'admin@example.com', role: Role.ADMIN });

    expect(result).toEqual({ id: 'u-1', email: 'admin@example.com', role: Role.ADMIN });
  });
});
