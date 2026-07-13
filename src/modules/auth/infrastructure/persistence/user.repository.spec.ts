import { Repository } from 'typeorm';
import { Role } from '../../domain/role.enum';
import { User } from '../../domain/user.entity';
import { UserOrmEntity } from './user.orm-entity';
import { UserRepository } from './user.repository';

function buildUser(): User {
  return User.fromPersistence({
    id: 'u-1',
    email: 'admin@example.com',
    passwordHash: 'hash',
    role: Role.ADMIN,
    refreshTokenHash: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('UserRepository', () => {
  let typeOrmRepository: jest.Mocked<Repository<UserOrmEntity>>;
  let repository: UserRepository;

  beforeEach(() => {
    typeOrmRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserOrmEntity>>;
    repository = new UserRepository(typeOrmRepository);
  });

  it('findByEmail returns null when not found', async () => {
    typeOrmRepository.findOne.mockResolvedValue(null);

    const result = await repository.findByEmail('missing@example.com');

    expect(result).toBeNull();
    expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'missing@example.com' },
    });
  });

  it('findByEmail maps the found ORM entity to a domain user', async () => {
    const user = buildUser();
    typeOrmRepository.findOne.mockResolvedValue(Object.assign(new UserOrmEntity(), user.toProps()));

    const result = await repository.findByEmail('admin@example.com');

    expect(result?.email).toBe('admin@example.com');
  });

  it('findById returns null when not found', async () => {
    typeOrmRepository.findOne.mockResolvedValue(null);

    const result = await repository.findById('missing');

    expect(result).toBeNull();
  });

  it('update persists the user and returns the mapped domain entity', async () => {
    const user = buildUser();
    typeOrmRepository.save.mockResolvedValue(Object.assign(new UserOrmEntity(), user.toProps()));

    const result = await repository.update(user);

    expect(result.id).toBe('u-1');
  });
});
