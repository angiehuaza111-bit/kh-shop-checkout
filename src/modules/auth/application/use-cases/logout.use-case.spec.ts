import { NotFoundDomainError } from '../../../../common/domain/domain-error';
import { Role } from '../../domain/role.enum';
import { User } from '../../domain/user.entity';
import { UserRepositoryPort } from '../../domain/user-repository.port';
import { LogoutUseCase } from './logout.use-case';

function buildUser(): User {
  return User.fromPersistence({
    id: 'u-1',
    email: 'admin@example.com',
    passwordHash: 'hash',
    role: Role.ADMIN,
    refreshTokenHash: 'some-hash',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('LogoutUseCase', () => {
  it('clears the stored refresh token hash', async () => {
    const user = buildUser();
    const userRepository: jest.Mocked<UserRepositoryPort> = {
      findByEmail: jest.fn(),
      findById: jest.fn().mockResolvedValue(user),
      update: jest.fn(),
    };
    const useCase = new LogoutUseCase(userRepository);

    await useCase.execute('u-1');

    expect(user.refreshTokenHash).toBeNull();
    expect(userRepository.update).toHaveBeenCalledWith(user);
  });

  it('throws NotFoundDomainError when the user does not exist', async () => {
    const userRepository: jest.Mocked<UserRepositoryPort> = {
      findByEmail: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    };
    const useCase = new LogoutUseCase(userRepository);

    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundDomainError);
  });
});
