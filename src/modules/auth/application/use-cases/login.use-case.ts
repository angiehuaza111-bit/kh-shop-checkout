import { Inject, Injectable } from '@nestjs/common';
import { UnauthorizedDomainError } from '../../../../common/domain/domain-error';
import { PASSWORD_HASHER, PasswordHasherPort } from '../../domain/password-hasher.port';
import { TOKEN_SERVICE, TokenPair, TokenServicePort } from '../../domain/token-service.port';
import { USER_REPOSITORY, UserRepositoryPort } from '../../domain/user-repository.port';

export interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenServicePort,
  ) {}

  async execute({ email, password }: LoginInput): Promise<TokenPair> {
    const user = await this.userRepository.findByEmail(email);
    if (!user?.isActive) {
      throw new UnauthorizedDomainError();
    }

    const passwordMatches = await this.passwordHasher.compare(password, user.passwordHash);
    if (!passwordMatches) {
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
}
