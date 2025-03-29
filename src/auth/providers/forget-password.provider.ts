import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/providers/mail.service';
import { UserService } from 'src/user/user.service';
import { PASSWORD_RESET_PURPOSE } from '../constants/auth.constants';
import { ForgetPasswordDto } from '../dto/forget-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { Role } from '../enums/role.enum';
import { User } from 'src/user/schemas/user.schema';

/**
 * ForgetPasswordProvider
 */
@Injectable()
export class ForgetPasswordProvider {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private jwtService: JwtService,
  ) {}

  /**
   * forgetPassword method
   */
  public async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    // find user by email
    const user = await this.userService.findOneByEmail(forgetPasswordDto.email);

    // generate otp
    const PasswordVerificationCode = Math.floor(
      100000 + Math.random() * 900000,
    );

    // save otp in the database
    const updatedUser = await this.userService.update(
      user._id.toString(),
      {
        PasswordVerificationCode,
        passwordVerificationCodeExpiresAt: new Date(
          Date.now() + this.configService.get('appConfig.otpTtl'),
        ),
      },
      ['PasswordVerificationCode'],
    );

    // send otp to the user's email

    await this.mailService.sendForgetPasswordOtp(updatedUser);

    return;
  }
  /**
   * verifyOtp method
   */
  public async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    let user;
    try {
      user = await this.userService.findOneByEmail(verifyOtpDto.email, [
        'PasswordVerificationCode',
        'passwordVerificationCodeExpiresAt',
      ]);
    } catch {
      // Don't reveal if email exists or not for security
      throw new BadRequestException('Invalid OTP verification attempt');
    }

    // Check if verification code exists
    if (!user.PasswordVerificationCode) {
      throw new BadRequestException('No OTP requested for this user');
    }

    // Check if OTP matches (use strict comparison)
    if (+user.PasswordVerificationCode !== +verifyOtpDto.otp) {
      // Consider tracking failed attempts here
      throw new BadRequestException('Invalid OTP');
    }

    // Check if OTP is expired
    if (
      !user.passwordVerificationCodeExpiresAt ||
      user.passwordVerificationCodeExpiresAt < new Date()
    ) {
      throw new BadRequestException('OTP expired');
    }

    // Generate reset token (valid for 10 minutes)
    const passwordResetToken = await this.jwtService.signAsync(
      {
        userId: user._id.toString(),
        email: user.email,
        purpose: PASSWORD_RESET_PURPOSE,
      },
      {
        secret:
          user.role === Role.User
            ? this.configService.get('jwt.userSecret')
            : this.configService.get('jwt.adminSecret'),
        expiresIn: '10m',
      },
    );

    // Clear OTP after successful verification to prevent reuse, and store reset token to check against its string structure in the reset password method to prevent using another valid token like the login token
    await this.userService.update(user._id.toString(), {
      PasswordVerificationCode: null,
      passwordVerificationCodeExpiresAt: null,
      passwordResetToken,
    });

    return { passwordResetToken };
  }

  /**
   * resetPassword method
   */
  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // find user by email
    const user = await this.userService.findOneByEmail(resetPasswordDto.email, [
      'passwordResetToken',
    ]);

    // Verify the reset token
    if (user.passwordResetToken !== resetPasswordDto.passwordResetToken) {
      throw new BadRequestException('Invalid reset token');
    }

    // Verify the reset token expiration

    try {
      const decoded = await this.jwtService.verifyAsync(
        resetPasswordDto.passwordResetToken,
        {
          secret:
            user.role === Role.User
              ? this.configService.get('jwt.userSecret')
              : this.configService.get('jwt.adminSecret'),
        },
      );
      //console.log({ decoded });

      /*  if (decoded.purpose !== PASSWORD_RESET_PURPOSE) {
        throw new BadRequestException('Invalid reset purpose');
      }

      if (user.email !== decoded.email) {
        throw new BadRequestException('Invalid reset attempt');
      } */
    } catch (error) {
      //console.log(error);
      throw new BadRequestException(
        'Invalid reset token, try getting another otp code',
      );
    }

    // store the new password, update method hashing the password internally
    const updatedUser = await this.userService.update(user._id.toString(), {
      passwordResetToken: null,
      passwordChangedAt: new Date(),
      password: resetPasswordDto.password,
    });
    //console.log({ updatedUser });
    return;
  }
}
