import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { REQUEST_USER_KEY } from '../constants/auth.constants';
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
    const token = this.extractTokenFromHeader(request);
    const roles = this.reflector.get(Roles, context.getHandler());
    //console.log({ roles, token });
    if (!roles) {
      return true;
    }
    //console.log({ roles, token });
    
    if (!token) {
      //console.log("token not found");
      throw new UnauthorizedException("token not found");
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: roles.includes(Role.User)
          ? this.configService.get('jwt.userSecret')
          : this.configService.get('jwt.adminSecret'),
      });
      //console.log({ roles, token, payload });

      if (!roles.includes(payload?.role)) {
        throw new UnauthorizedException("unauthorized role");
      }
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request[REQUEST_USER_KEY] = payload;
    } catch {
      throw new UnauthorizedException("invalid token");
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
