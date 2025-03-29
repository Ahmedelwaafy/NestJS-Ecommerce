import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { RESPONSE_MESSAGE } from '../../decorators/response-message.decorator';

@Injectable()
export class DataResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const msg =
      this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) ||
      'Operation successful';

    const status = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data) => ({
        status,
        msg,
        data,
      })),
    );
  }
}
