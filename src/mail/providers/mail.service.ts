import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common/exceptions';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  public async sendUserWelcome(user: User): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Welcome to the app',
        template: './welcome',
        context: {
          name: user?.name,
          email: user?.email,
          loginUrl: 'http://localhost:3000/login',
        },
      });
    } catch (error) {
      if (error.response.statusCode === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new InternalServerErrorException(
        'An error occurred while sending the email',
      );
    }
  }
  public async sendForgetPasswordOtp(user: User): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'E-Commerce-NestJS - Forget Password OTP',
        template: './forget-password',
        context: {
          name: user?.name,
          email: user?.email,
          otp: user?.PasswordVerificationCode,
        },
      });
    } catch (error) {
      if (error.response.statusCode === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new InternalServerErrorException(
        'An error occurred while sending the email',
      );
    }
  }
}
