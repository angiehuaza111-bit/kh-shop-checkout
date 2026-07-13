import { UnauthorizedDomainError } from '../../../../common/domain/domain-error';
import { PasswordHasherPort } from '../../domain/password-hasher.port';
import { Role } from '../../domain/role.enum';
import { TokenServicePort } from '../../domain/token-service.port';
import { User } from '../../domain/user.entity';
import { UserRepositoryPort } from '../../domain/user-repository.port';
import { RefreshTokenUseCase } from './refresh-token.use-case';

function buildUser(refreshTokenHash: string | null = 'stored-hash', isActive = true): User {
  return User.fromPersistence({
    id: 'u-1',
    email: 'admin@example.com',
    passwordHash: 'hashed-password',
    role: Role.ADMIN,
    refreshTokenHash,
    isActive,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('RefreshTokenUseCase', () => {
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;
  let tokenService: jest.Mocked<TokenServicePort>;
  let useCase: RefreshTokenUseCase;

  beforeEach(() => {
    userRepository = { findByEmail: jest.fn(), findById: jest.fn(), update: jest.fn() };
    passwordHasher = { hash: jest.fn(), compare: jest.fn() };
    tokenService = { generateTokenPair: jest.fn(), verifyRefreshToken: jest.fn() };
    useCase = new RefreshTokenUseCase(userRepository, passwordHasher, tokenService);
  });

  it('rotates the refresh token when the provided one is valid', async () => {
    tokenService.verifyRefreshToken.mockReturnValue({
      sub: 'u-1',
      email: 'admin@example.com',
      role: Role.ADMIN,
    });
    userRepository.findById.mockResolvedValue(buildUser());
    passwordHasher.compare.mockResolvedValue(true);
    passwordHasher.hash.mockResolvedValue('new-hash');
    tokenService.generateTokenPair.mockReturnValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });

    const result = await useCase.execute('old-refresh-token');

    expect(result).toEqual({ accessToken: 'new-access', refreshToken: 'new-refresh' });
    expect(userRepository.update).toHaveBeenCalled();
  });

  it('throws UnauthorizedDomainError when the token signature is invalid', async () => {
    tokenService.verifyRefreshToken.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    await expect(useCase.execute('tampered-token')).rejects.toThrow(UnauthorizedDomainError);
  });

  it('throws UnauthorizedDomainError when the user has no stored refresh token', async () => {
    tokenService.verifyRefreshToken.mockReturnValue({
      sub: 'u-1',
      email: 'admin@example.com',
      role: Role.ADMIN,
    });
    userRepository.findById.mockResolvedValue(buildUser(null));

    await expect(useCase.execute('some-token')).rejects.toThrow(UnauthorizedDomainError);
  });

  it('throws UnauthorizedDomainError when the stored hash does not match', async () => {
    tokenService.verifyRefreshToken.mockReturnValue({
      sub: 'u-1',
      email: 'admin@example.com',
      role: Role.ADMIN,
    });
    userRepository.findById.mockResolvedValue(buildUser());
    passwordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute('some-token')).rejects.toThrow(UnauthorizedDomainError);
  });

  it('throws UnauthorizedDomainError when the user is inactive', async () => {
    tokenService.verifyRefreshToken.mockReturnValue({
      sub: 'u-1',
      email: 'admin@example.com',
      role: Role.ADMIN,
    });
    userRepository.findById.mockResolvedValue(buildUser('stored-hash', false));

    await expect(useCase.execute('some-token')).rejects.toThrow(UnauthorizedDomainError);
  });
});
