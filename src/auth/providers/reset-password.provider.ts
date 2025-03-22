import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { SignInDto } from '../dto/signin.dto';
import { HashingProvider } from './hashing.provider';
import { UserService } from 'src/user/user.service';
import { Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from '../constants/auth.constants';
import { GenerateTokensProvider } from './generate-tokens.provider';
import jwtConfig from 'src/config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { ResetPasswordDto } from '../dto/reset-password-dto.dto copy';

/**
 * ResetPasswordProvider
 */
@Injectable()
export class ResetPasswordProvider {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly hashingProvider: HashingProvider,

    private readonly generateTokensProvider: GenerateTokensProvider,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  /**
   * signIn method
   */
  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // find user by email
    const user = await this.userService.findOneByEmail(resetPasswordDto.email);

    // generate otp
    const otp = Math.floor(100000 + Math.random() * 900000);

    // send otp to the user's email
    console.log(otp);
    return otp;
  }
}
