import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../domain/role.enum';
import { JwtTokenService } from './jwt-token.service';

describe('JwtTokenService', () => {
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let service: JwtTokenService;

  const jwtConfig = {
    accessSecret: 'access-secret',
    accessExpiresIn: '15m',
    refreshSecret: 'refresh-secret',
    refreshExpiresIn: '7d',
  };

  beforeEach(() => {
    jwtService = { sign: jest.fn(), verify: jest.fn() } as unknown as jest.Mocked<JwtService>;
    configService = {
      get: jest.fn().mockReturnValue(jwtConfig),
    } as unknown as jest.Mocked<ConfigService>;
    service = new JwtTokenService(jwtService, configService);
  });

  it('generates an access and refresh token signed with their respective secrets', () => {
    jwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

    const payload = { sub: 'u-1', email: 'admin@example.com', role: Role.ADMIN };
    const result = service.generateTokenPair(payload);

    expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    expect(jwtService.sign).toHaveBeenNthCalledWith(1, payload, {
      secret: 'access-secret',
      expiresIn: '15m',
    });
    expect(jwtService.sign).toHaveBeenNthCalledWith(2, payload, {
      secret: 'refresh-secret',
      expiresIn: '7d',
    });
  });

  it('verifies a refresh token using the refresh secret', () => {
    const payload = { sub: 'u-1', email: 'admin@example.com', role: Role.ADMIN };
    jwtService.verify.mockReturnValue(payload);

    const result = service.verifyRefreshToken('some-token');

    expect(result).toEqual(payload);
    expect(jwtService.verify).toHaveBeenCalledWith('some-token', { secret: 'refresh-secret' });
  });
});
