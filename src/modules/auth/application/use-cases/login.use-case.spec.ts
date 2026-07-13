import { UnauthorizedDomainError } from '../../../../common/domain/domain-error';
import { PasswordHasherPort } from '../../domain/password-hasher.port';
import { Role } from '../../domain/role.enum';
import { TokenServicePort } from '../../domain/token-service.port';
import { User } from '../../domain/user.entity';
import { UserRepositoryPort } from '../../domain/user-repository.port';
import { LoginUseCase } from './login.use-case';

function buildUser(overrides: Partial<{ isActive: boolean }> = {}): User {
  return User.fromPersistence({
    id: 'u-1',
    email: 'admin@example.com',
    passwordHash: 'hashed-password',
    role: Role.ADMIN,
    refreshTokenHash: null,
    isActive: overrides.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('LoginUseCase', () => {
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;
  let tokenService: jest.Mocked<TokenServicePort>;
  let useCase: LoginUseCase;

  beforeEach(() => {
    userRepository = { findByEmail: jest.fn(), findById: jest.fn(), update: jest.fn() };
    passwordHasher = { hash: jest.fn(), compare: jest.fn() };
    tokenService = { generateTokenPair: jest.fn(), verifyRefreshToken: jest.fn() };
    useCase = new LoginUseCase(userRepository, passwordHasher, tokenService);
  });

  it('returns a token pair for valid credentials and stores the hashed refresh token', async () => {
    const user = buildUser();
    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.compare.mockResolvedValue(true);
    passwordHasher.hash.mockResolvedValue('hashed-refresh-token');
    tokenService.generateTokenPair.mockReturnValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    const result = await useCase.execute({ email: 'admin@example.com', password: 'secret' });

    expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    expect(userRepository.update).toHaveBeenCalledWith(user);
    expect(user.refreshTokenHash).toBe('hashed-refresh-token');
  });

  it('throws UnauthorizedDomainError when the user does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute({ email: 'missing@example.com', password: 'x' })).rejects.toThrow(
      UnauthorizedDomainError,
    );
  });

  it('throws UnauthorizedDomainError when the user is inactive', async () => {
    userRepository.findByEmail.mockResolvedValue(buildUser({ isActive: false }));

    await expect(useCase.execute({ email: 'admin@example.com', password: 'x' })).rejects.toThrow(
      UnauthorizedDomainError,
    );
  });

  it('throws UnauthorizedDomainError when the password does not match', async () => {
    userRepository.findByEmail.mockResolvedValue(buildUser());
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'admin@example.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedDomainError);
  });
});
