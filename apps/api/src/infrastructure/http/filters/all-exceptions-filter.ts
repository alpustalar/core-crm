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
import { DomainException } from '@src/domain/exceptions/domain.exception';
import { ERROR_CODES } from '@common/constants/error-codes.constant';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP_ERROR');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal Server Error';
    let errorCode: string = 'INTERNAL_SERVER_ERROR';
    let meta: any = undefined;

    if (exception instanceof DomainException) {
      status = exception.httpStatus;
      message = exception.message;
      errorCode = exception.errorCode;
      meta = exception.meta; // 🎯 Domain'den gelen meta veri
    }
    // 2️⃣ NESTJS YERLEŞİK HTTP HATALARI
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const httpResponse: any = exception.getResponse();

      if (typeof httpResponse === 'object') {
        message = httpResponse.message || httpResponse;
        if (
          status === HttpStatus.BAD_REQUEST &&
          Array.isArray(httpResponse.message)
        ) {
          errorCode = ERROR_CODES.VALIDATION.FAILED;
          meta = { validationErrors: httpResponse.message };
          message = 'İstek verileri doğrulamadan geçemedi.';
        } else {
          errorCode = ERROR_CODES.HTTP.ERROR;
        }
      } else {
        message = httpResponse;
        errorCode = ERROR_CODES.HTTP.ERROR;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const errorConfig = PrismaErrorMap[exception.code];
      if (errorConfig) {
        status = errorConfig.status;
        message = errorConfig.userMessage;
        errorCode = `PRISMA.${exception.code}`;
        meta = { prismaTarget: exception.meta?.target };
      }
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Veritabanı bağlantısı kurulamadı.';
      errorCode = ERROR_CODES.DATABASE.CONNECTION_ERROR;
    }

    this.logger.error(
      `❌ [${errorCode}] ${request.method} ${request.url} | Status: ${status} | Message: ${JSON.stringify(message)} ${meta ? `| Meta: ${JSON.stringify(meta)}` : ''}`
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      code: errorCode,
      error: message,
      meta: meta,
      timestamp: new Date().toISOString(),
    });
  }
}
