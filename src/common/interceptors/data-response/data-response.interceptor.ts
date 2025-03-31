import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { RESPONSE_MESSAGE } from '../../decorators/response-message.decorator';
import { I18nHelperService } from 'src/i18n/providers/I18n-helper-service';

@Injectable()
export class DataResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly i18nHelper: I18nHelperService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const messageKey =
      this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) ||
      'common.operation_succeeded';

    const status = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data) => {
        // Translate the message
        const translatedMsg = this.i18nHelper.t(messageKey);

        return {
          status,
          msg: translatedMsg,
          data,
        };
      }),
    );
  }
}
