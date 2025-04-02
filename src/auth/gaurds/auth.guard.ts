import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REQUEST_USER_KEY,
} from '../constants/auth.constants';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    //const token = this.extractTokenFromHeader(request);
    const token = this.extractHttpOnlyAccessTokenCookie(request);
    const roles = this.reflector.get(Roles, context.getHandler());
    //console.log({ roles, token });
    if (!roles) {
      return true;
    }
    //console.log({ roles, token });

    if (!token) {
      //console.log("token not found");
      throw new UnauthorizedException('token not found');
    }
    //enable AuthGuard to handle both admin and user (registered users) roles for the same route
    // First, determine which secrets to try
    const tryUserSecret = roles.includes(Role.User);
    const tryAdminSecret = roles.includes(Role.Admin);
    let payload = null;
    let role = null;
    let verificationError = null;

    // Try verifying with the appropriate secrets
    if (tryUserSecret) {
      try {
        payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get('jwt.userSecret'),
        });
        role = Role.User;
      } catch (error) {
        verificationError = error;
      }
    }

    // If user verification failed or wasn't attempted, try admin secret if applicable
    if (!payload && tryAdminSecret) {
      try {
        payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get('jwt.adminSecret'),
        });
        role = Role.Admin;

        verificationError = null; // Clear error if admin verification succeeds
      } catch (error) {
        verificationError = error;
      }
    }

    // If payload is still null, throw the last error encountered
    if (!payload) {
      //throw verificationError ||
      throw new UnauthorizedException('invalid token');
    }

    //console.log({ roles, token, payload });

    //* handle if the role is altered manually, like from https://jwt.io/
    //!Solution-1: check if the role is included in the roles array set by the Roles decorator
    /* if (!roles.includes(payload?.role)) {
      throw new UnauthorizedException('unauthorized role');
    } */

    // 💡 We're assigning the payload to the request object here
    // so that we can access it in our route handlers
    //!Solution-2: assign the role based on the success secret not from the decoded payload, this solution is more secure if the guard handles both roles, so Solution-1 is more disabled
    request[REQUEST_USER_KEY] = { ...payload, role };

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
  private extractHttpOnlyAccessTokenCookie(request: Request) {
    const token = request.cookies?.[ACCESS_TOKEN_COOKIE_NAME];
    return token;
  }
}
