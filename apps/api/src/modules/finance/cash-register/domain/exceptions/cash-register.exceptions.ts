import { ERROR_CODES } from '@common/constants/error-codes.constant';
import { DomainException } from '@src/domain/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

export class CashRegisterNotFoundException extends DomainException<{
  cashRegisterId?: string;
}> {
  readonly errorCode = ERROR_CODES.CASH_REGISTER.NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(cashRegisterId?: string) {
    super('Kasa bulunamadı.', { cashRegisterId });
  }
}

export class CashRegisterArchivedException extends DomainException<{
  cashRegisterId?: string;
}> {
  readonly errorCode = ERROR_CODES.CASH_REGISTER.ARCHIVED;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(cashRegisterId?: string) {
    super('Arşivlenmiş bir kasada bu işlem yapılamaz.', { cashRegisterId });
  }
}

export class CashSessionNotFoundException extends DomainException<{
  cashSessionId?: string;
}> {
  readonly errorCode = ERROR_CODES.CASH_SESSION.NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(cashSessionId?: string) {
    super('Kasa oturumu bulunamadı.', { cashSessionId });
  }
}

export class CashSessionNotOpenException extends DomainException<{
  currentStatus?: string;
}> {
  readonly errorCode = ERROR_CODES.CASH_SESSION.NOT_OPEN;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(currentStatus?: string) {
    super('İşlem için kasa oturumunun açık (OPEN) olması gerekir.', {
      currentStatus,
    });
  }
}

export class CashSessionAlreadyOpenException extends DomainException<{
  cashRegisterId?: string;
  openSessionId?: string;
}> {
  readonly errorCode = ERROR_CODES.CASH_SESSION.ALREADY_OPEN;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(meta: { cashRegisterId?: string; openSessionId?: string }) {
    super(
      'Bu kasada zaten açık bir oturum var. Yeni oturum açmadan önce kapatın.',
      meta
    );
  }
}

export class CashInvalidAmountException extends DomainException<{
  amount?: number;
}> {
  readonly errorCode = ERROR_CODES.CASH_SESSION.INVALID_AMOUNT;

  constructor(message = 'Tutar sıfırdan büyük olmalıdır.', amount?: number) {
    super(message, { amount });
  }
}
