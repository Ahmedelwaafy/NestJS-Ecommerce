import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const msg =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? exceptionResponse.message
        : exception.message;

    response.status(status).json({
      status,
      msg: Array.isArray(msg) ? msg[0] : msg,
      data: null,
    });
  }
}
