import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { ResetPasswordDto } from '../dto/reset-password-dto.dto copy';
import { MailService } from 'src/mail/providers/mail.service';

/**
 * ResetPasswordProvider
 */
@Injectable()
export class ResetPasswordProvider {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /**
   * resetPassword method
   */
  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // find user by email
    const user = await this.userService.findOneByEmail(resetPasswordDto.email);

    // generate otp
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // save otp in the database
    const updatedUser = await this.userService.update(user._id.toString(), {
      verificationCode,
      passwordResetExpires: new Date(
        Date.now() + this.configService.get('appConfig.otpTtl'),
      ),
    });

    // send otp to the user's email

    await this.mailService.sendResetPasswordOtp(updatedUser);

    return;
  }
}
