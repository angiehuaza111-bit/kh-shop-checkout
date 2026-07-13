import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenPairResponseDto } from './dto/token-pair-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedUser } from './strategies/jwt.strategy';

const LOGIN_THROTTLE_LIMIT = Number(process.env.THROTTLE_LOGIN_LIMIT ?? 5);
const LOGIN_THROTTLE_TTL_MS = Number(process.env.THROTTLE_LOGIN_TTL_MS ?? 60000);

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: LOGIN_THROTTLE_LIMIT, ttl: LOGIN_THROTTLE_TTL_MS } })
  @ApiOperation({ summary: 'Admin login, returns an access + refresh token pair' })
  async login(@Body() dto: LoginDto): Promise<TokenPairResponseDto> {
    const tokens = await this.loginUseCase.execute(dto);
    return TokenPairResponseDto.fromTokenPair(tokens);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the access + refresh token pair' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenPairResponseDto> {
    const tokens = await this.refreshTokenUseCase.execute(dto.refreshToken);
    return TokenPairResponseDto.fromTokenPair(tokens);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke the current refresh token' })
  async logout(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.logoutUseCase.execute(user.id);
  }
}
