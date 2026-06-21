/* eslint-disable */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaErrorMap } from '@common/constants';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP_ERROR');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const errorConfig = PrismaErrorMap[exception.code];
      if (errorConfig) {
        status = errorConfig.status;
        message = {
          message: errorConfig.userMessage,
          errorCode: exception.code,
        };
      }
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Veritabanı bağlantısı kurulamadı.';
    }

    this.logger.error(
      `❌ ${request.method} ${request.url} | Status: ${status} | Message: ${JSON.stringify(message)}`
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      error: message,
    });
  }
}
