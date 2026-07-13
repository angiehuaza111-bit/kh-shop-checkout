import { LoginUseCase } from '../application/use-cases/login.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { Role } from '../domain/role.enum';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;
  let logoutUseCase: jest.Mocked<LogoutUseCase>;

  beforeEach(() => {
    loginUseCase = { execute: jest.fn() } as unknown as jest.Mocked<LoginUseCase>;
    refreshTokenUseCase = { execute: jest.fn() } as unknown as jest.Mocked<RefreshTokenUseCase>;
    logoutUseCase = { execute: jest.fn() } as unknown as jest.Mocked<LogoutUseCase>;
    controller = new AuthController(loginUseCase, refreshTokenUseCase, logoutUseCase);
  });

  it('login returns the token pair from the use case', async () => {
    loginUseCase.execute.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' });

    const result = await controller.login({ email: 'admin@example.com', password: 'secret123' });

    expect(result).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });

  it('refresh returns a rotated token pair', async () => {
    refreshTokenUseCase.execute.mockResolvedValue({ accessToken: 'a2', refreshToken: 'r2' });

    const result = await controller.refresh({ refreshToken: 'old' });

    expect(result).toEqual({ accessToken: 'a2', refreshToken: 'r2' });
    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith('old');
  });

  it('logout revokes the current user refresh token', async () => {
    await controller.logout({ id: 'u-1', email: 'admin@example.com', role: Role.ADMIN });

    expect(logoutUseCase.execute).toHaveBeenCalledWith('u-1');
  });
});
