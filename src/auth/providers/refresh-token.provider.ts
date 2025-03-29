import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import jwtConfig from 'src/config/jwt.config';
import { UserService } from 'src/user/user.service';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from '../constants/auth.constants';
import { Role } from '../enums/role.enum';
import { ActiveUserData } from '../interfaces/active-user.interface';
import { GenerateTokensProvider } from './generate-tokens.provider';

@Injectable()
export class RefreshTokenProvider {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly generateTokensProvider: GenerateTokensProvider,
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public async refreshToken(request: Request, response: Response, role: Role) {
    // Extract refresh token from cookies
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken) {
      throw new UnauthorizedException('token not found');
    }
    //console.log({ refreshToken });

    //verify the refresh token using jwtService
    let payload: Pick<ActiveUserData, 'id'>;

    try {
      payload = await this.jwtService.verifyAsync<Pick<ActiveUserData, 'id'>>(
        refreshToken,
        {
          secret:
            role === Role.User
              ? this.jwtConfiguration.userSecret
              : this.jwtConfiguration.adminSecret,
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
        },
      );
    } catch (error) {
      throw new UnauthorizedException('invalid or expired token');
    }

    //fetch user from the database

    const user = await this.userService.findOne(payload.id);

    // Generate tokens
    const tokens = await this.generateTokensProvider.generateTokens(user);

    // Set tokens as HTTP-only cookies
    response.cookie(ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false, // Ensures the cookie is only sent over HTTPS in production.
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : false, //'Lax': Helps prevent CSRF attacks while ensuring the cookie is sent with top-level navigations
      maxAge: this.jwtConfiguration.accessTokenTtl,
    });
  }
}
