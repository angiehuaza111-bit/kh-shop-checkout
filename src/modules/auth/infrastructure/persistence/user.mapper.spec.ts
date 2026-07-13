import { Role } from '../../domain/role.enum';
import { User } from '../../domain/user.entity';
import { UserMapper } from './user.mapper';

describe('UserMapper', () => {
  it('maps a domain user to an ORM entity and back without losing data', () => {
    const user = User.fromPersistence({
      id: 'u-1',
      email: 'admin@example.com',
      passwordHash: 'hash',
      role: Role.ADMIN,
      refreshTokenHash: 'refresh-hash',
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    const orm = UserMapper.toOrm(user);
    const roundTripped = UserMapper.toDomain(orm);

    expect(roundTripped.toProps()).toEqual(user.toProps());
  });
});
