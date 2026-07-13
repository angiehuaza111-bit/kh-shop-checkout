import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { PASSWORD_HASHER } from './domain/password-hasher.port';
import { TOKEN_SERVICE } from './domain/token-service.port';
import { USER_REPOSITORY } from './domain/user-repository.port';
import { Argon2PasswordHasher } from './infrastructure/hashing/argon2-password-hasher';
import { JwtTokenService } from './infrastructure/jwt/jwt-token.service';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { AuthController } from './presentation/auth.controller';
import { JwtStrategy } from './presentation/strategies/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity]), PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    { provide: USER_REPOSITORY, useClass: UserRepository },
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
  ],
})
export class AuthModule {}
