import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainError } from '../../../../common/domain/domain-error';
import { USER_REPOSITORY, UserRepositoryPort } from '../../domain/user-repository.port';

@Injectable()
export class LogoutUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundDomainError('User', userId);
    }
    user.setRefreshTokenHash(null);
    await this.userRepository.update(user);
  }
}
