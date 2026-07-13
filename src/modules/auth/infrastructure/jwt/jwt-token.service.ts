import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Configuration } from '../../../../config/configuration';
import { TokenPair, TokenPayload, TokenServicePort } from '../../domain/token-service.port';

type ExpiresIn = JwtSignOptions['expiresIn'];

@Injectable()
export class JwtTokenService implements TokenServicePort {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Configuration, true>,
  ) {}

  generateTokenPair(payload: TokenPayload): TokenPair {
    const jwt = this.configService.get('jwt', { infer: true });

    const accessToken = this.jwtService.sign(payload, {
      secret: jwt.accessSecret,
      expiresIn: jwt.accessExpiresIn as ExpiresIn,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: jwt.refreshSecret,
      expiresIn: jwt.refreshExpiresIn as ExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  verifyRefreshToken(token: string): TokenPayload {
    const jwt = this.configService.get('jwt', { infer: true });
    return this.jwtService.verify<TokenPayload>(token, { secret: jwt.refreshSecret });
  }
}
