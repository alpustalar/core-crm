import { DomainException } from '@src/domain/exceptions/domain.exception';
import { ERROR_CODES } from '@common/constants/error-codes.constant';
import { HttpStatus } from '@nestjs/common';

export class PeriodNotFoundException extends DomainException {
  readonly errorCode = ERROR_CODES.PERIOD.NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;
  constructor() {
    super('Dönem bulunamadı');
  }
}

export class PeriodAlreadyClosedException extends DomainException<{
  periodId?: string;
  year?: number;
}> {
  readonly errorCode = ERROR_CODES.PERIOD.ALREADY_CLOSED;
  constructor(periodId?: string, year?: number) {
    super('Dönem zaten kapatılmış', {
      periodId,
      year,
    });
  }
}

export class PeriodAlreadyExistsException extends DomainException<{
  year: number;
}> {
  readonly errorCode = ERROR_CODES.PERIOD.ALREADY_EXISTS;

  constructor(year: number) {
    super(`${year} yılı için muhasebe dönemi zaten mevcut.`, { year });
  }
}

export class InvalidPeriodLockException extends DomainException<{
  currentStatus?: string;
}> {
  readonly errorCode = ERROR_CODES.PERIOD.INVALID_LOCK_STATUS;
  constructor(currentStatus?: string) {
    super('Yalnızca açık dönemler kilitlenebilir.', { currentStatus });
  }
}

export class InvalidPeriodReopenException extends DomainException<{
  currentStatus?: string;
}> {
  readonly errorCode = ERROR_CODES.PERIOD.INVALID_REOPEN_STATUS;
  constructor(currentStatus?: string) {
    super('Yalnızca kilitli dönemler yeniden açılabilir.', { currentStatus });
  }
}
