import { User } from './user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(user: User): Promise<User>;
}
