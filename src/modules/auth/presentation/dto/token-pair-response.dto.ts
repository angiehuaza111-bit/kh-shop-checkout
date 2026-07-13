import { ApiProperty } from '@nestjs/swagger';
import { TokenPair } from '../../domain/token-service.port';

export class TokenPairResponseDto {
  @ApiProperty() accessToken: string;
  @ApiProperty() refreshToken: string;

  private constructor(tokens: TokenPair) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
  }

  static fromTokenPair(tokens: TokenPair): TokenPairResponseDto {
    return new TokenPairResponseDto(tokens);
  }
}
