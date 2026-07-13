import { Role } from './role.enum';

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenServicePort {
  generateTokenPair(payload: TokenPayload): TokenPair;
  verifyRefreshToken(token: string): TokenPayload;
}
