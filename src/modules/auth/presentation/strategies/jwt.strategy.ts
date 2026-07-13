import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Configuration } from '../../../../config/configuration';
import { TokenPayload } from '../../domain/token-service.port';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: TokenPayload['role'];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService<Configuration, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt', { infer: true }).accessSecret,
    });
  }

  validate(payload: TokenPayload): AuthenticatedUser {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
