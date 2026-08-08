import { Catch, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaErrorMap } from '@common/constants';
import { ERROR_CODES } from '@common/constants/error-codes.constant';
import { BaseExceptionFilter, MappedException } from '@src/http';

/**
 * Çekirdek filtresinin api'ye özgü genişletmesi: Prisma hataları.
 * Ortak dallar (DomainException, HttpException, 500) tabandadır.
 */
@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  protected override mapPlatformException(
    exception: unknown
  ): MappedException | null {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const errorConfig = PrismaErrorMap[exception.code];
      // Haritada yoksa tanımadığımız bir Prisma kodu — taban 500'e düşsün.
      if (!errorConfig) return null;

      return {
        status: errorConfig.status,
        message: errorConfig.userMessage,
        errorCode: `PRISMA.${exception.code}`,
        meta: { prismaTarget: exception.meta?.target },
      };
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Veritabanı bağlantısı kurulamadı.',
        errorCode: ERROR_CODES.DATABASE.CONNECTION_ERROR,
      };
    }

    return null;
  }
}
