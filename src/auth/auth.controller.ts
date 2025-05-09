import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { Role } from './enums/role.enum';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

/**
 * AuthController
 */
@Controller('v1/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * //***** signIn ******
   */
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logged in successfully',
  })
  @ApiOperation({
    summary: 'signin as a user',
    description: 'signin as a user',
  })
  @ApiBody({
    description: 'User credentials for login',
    type: SignInDto,
  })
  @ResponseMessage(['LOGGED_IN_SUCCESSFULLY'])
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signIn(signInDto, response);
  }

  /**
   * //***** signUp ******
   */
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Account created successfully',
  })
  @ApiOperation({
    summary: 'Create a new account',
    description: 'Create a new account',
  })
  @ApiBody({
    description: 'User details for signup',
    type: SignUpDto,
  })
  @ResponseMessage(['ACCOUNT_CREATED_SUCCESSFULLY'])
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  /**
   * //***** signOut ******
   */
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Signed out successfully',
  })
  @ApiOperation({
    summary: 'Sign out',
    description: 'Sign out',
  })
  @ResponseMessage(['SIGN_OUT_SUCCESSFULLY'])
  async signOut(@Res({ passthrough: true }) response: Response) {
    return this.authService.signOut(response);
  }

  /**
   * //***** refresh user token ******
   */
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access token generated successfully',
  })
  @ApiOperation({
    summary: 'Generate new access token',
    description: 'Generate new access token',
  })
  @ResponseMessage(['ACCESS_TOKEN_GENERATED_SUCCESSFULLY'])
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.refreshToken(request, response, Role.User);
  }

  /**
   * //***** forget password ******
   */
  @Post('forget-password')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Code sent to your mail successfully',
  })
  @ApiOperation({
    summary: 'Get Forget password otp code ',
    description: 'Send the email to get the forget password otp code',
  })
  @ApiBody({
    description: 'User email for forget password',
    type: ForgetPasswordDto,
  })
  @ResponseMessage(['CODE_SENT_TO_YOUR_MAIL_SUCCESSFULLY'])
  async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
  }

  /**
   * //***** verify-otp ******
   */
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Otp code verified successfully',
  })
  @ApiOperation({
    summary: 'Verify the otp code ',
    description: 'Send the email along with the otp to verify the otp code',
  })
  @ApiBody({
    description: 'the email along with the otp code',
    type: VerifyOtpDto,
  })
  @ResponseMessage(['OTP_CODE_VERIFIED_SUCCESSFULLY'])
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  /**
   * //***** reset password ******
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password has been reset successfully',
  })
  @ApiOperation({
    summary: 'reset the password',
    description:
      'Send the email along with the new passwords to reset the password',
  })
  @ApiBody({
    description: 'User email along with the new passwords for reset password',
    type: ResetPasswordDto,
  })
  @ResponseMessage(['PASSWORD_RESET_SUCCESSFULLY'])
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
  /**
   * //***** resend otp ******
   */
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'A new otp code has been sent to your email successfully',
  })
  @ApiOperation({
    summary: 'resend the otp',
    description: 'Send the email to resend the otp',
  })
  @ApiBody({
    description: 'User email for resend otp',
    type: ResetPasswordDto,
  })
  @ResponseMessage(['NEW_CODE_SENT_TO_YOUR_MAIL_SUCCESSFULLY'])
  async resendOtp(@Body() resendOtpDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(resendOtpDto);
  }
  //TODO: refresh admin token, access the token from the authorization bearer as well as http-only cookie, whereas mobile apps don't have cookies
}
