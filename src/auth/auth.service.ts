import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SignInDto } from './dto/signin.dto';
import { Response } from 'express';
import { SignInProvider } from './providers/sign-in.provider';
import { UserService } from 'src/user/user.service';
import { SignUpDto } from './dto/signup.dto';
import { Role } from './enums/role.enum';
import { SignOutProvider } from './providers/sign-out.provider';

/**
 * AuthService
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly signInProvider: SignInProvider,
    private readonly signOutProvider: SignOutProvider,
  ) {}

  /**
   * //***** signIn ******
   */
  public async signIn(signInDto: SignInDto, response: Response) {
    return await this.signInProvider.signIn(signInDto, response);
  }

  /**
   * //***** signUp ******
   */
  public async signUp(signUpDto: SignUpDto) {
    return await this.userService.create({ ...signUpDto, role: Role.User });
  }

  /**
   * //***** signOut ******
   */
  public async signOut(response: Response) {
    return await this.signOutProvider.signOut(response);
  }
}
