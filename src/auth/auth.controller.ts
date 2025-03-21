import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/signin.dto';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Response } from 'express';
import { AuthService } from './auth.service';

/**
 * AuthController
 */
@Controller('v1/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @ResponseMessage('Logged in successfully')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signIn(signInDto, response);
  }
}
