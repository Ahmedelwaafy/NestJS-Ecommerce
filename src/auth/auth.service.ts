import { Injectable } from '@nestjs/common';
import { SignInDto } from './dto/signin.dto';
import { Response } from 'express';
import { SignInProvider } from './providers/sign-in.provider';

/**
 * AuthService
 */
@Injectable()
export class AuthService {
  constructor(
    
    private readonly signInProvider: SignInProvider) {}

  /**
   * signIn
   */
  public async signIn(signInDto: SignInDto, response: Response) {
    return await this.signInProvider.signIn(signInDto, response);
  }
}
