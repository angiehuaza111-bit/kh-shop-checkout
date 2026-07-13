import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/user.entity';
import { UserRepositoryPort } from '../../domain/user-repository.port';
import { UserMapper } from './user.mapper';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const orm = await this.repository.findOne({ where: { email } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async findById(id: string): Promise<User | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async update(user: User): Promise<User> {
    const orm = await this.repository.save(UserMapper.toOrm(user));
    return UserMapper.toDomain(orm);
  }
}
