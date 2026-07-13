import { User } from '../../domain/user.entity';
import { UserOrmEntity } from './user.orm-entity';

export class UserMapper {
  static toDomain(orm: UserOrmEntity): User {
    return User.fromPersistence({
      id: orm.id,
      email: orm.email,
      passwordHash: orm.passwordHash,
      role: orm.role,
      refreshTokenHash: orm.refreshTokenHash,
      isActive: orm.isActive,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(user: User): UserOrmEntity {
    const props = user.toProps();
    const orm = new UserOrmEntity();
    orm.id = props.id;
    orm.email = props.email;
    orm.passwordHash = props.passwordHash;
    orm.role = props.role;
    orm.refreshTokenHash = props.refreshTokenHash;
    orm.isActive = props.isActive;
    orm.createdAt = props.createdAt;
    orm.updatedAt = props.updatedAt;
    return orm;
  }
}
