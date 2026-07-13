import { Inject, Injectable } from '@nestjs/common';
import { UnauthorizedDomainError } from '../../../../common/domain/domain-error';
import { PASSWORD_HASHER, PasswordHasherPort } from '../../domain/password-hasher.port';
import { TOKEN_SERVICE, TokenPair, TokenServicePort } from '../../domain/token-service.port';
import { USER_REPOSITORY, UserRepositoryPort } from '../../domain/user-repository.port';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenServicePort,
  ) {}

  async execute(providedRefreshToken: string): Promise<TokenPair> {
    const payload = this.verify(providedRefreshToken);

    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new UnauthorizedDomainError();
    }

    const matches = await this.passwordHasher.compare(providedRefreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedDomainError();
    }

    const tokens = this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    user.setRefreshTokenHash(await this.passwordHasher.hash(tokens.refreshToken));
    await this.userRepository.update(user);

    return tokens;
  }

  private verify(token: string) {
    try {
      return this.tokenService.verifyRefreshToken(token);
    } catch {
      throw new UnauthorizedDomainError('Invalid or expired refresh token');
    }
  }
}
