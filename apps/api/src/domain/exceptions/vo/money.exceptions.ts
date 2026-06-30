import { ERROR_CODES } from '@common/constants/error-codes.constant';
import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@src/domain/exceptions/domain.exception';

export class InvalidMoneyAmountException extends DomainException<{
  message?: string;
}> {
  readonly errorCode = ERROR_CODES.MONEY.NOT_POSITIVE;
  public override readonly httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor(message?: string) {
    super(message ?? 'Finansal işlem tutarı sıfırdan büyük olmak zorundadır.');
  }
}

export class InvalidAllocationCountException extends DomainException<{
  count?: number;
}> {
  readonly errorCode = ERROR_CODES.MONEY.INVALID_ALLOCATION_COUNT;
  public override readonly httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor(count?: number) {
    super('Paylaştırma sayısı 0 veya daha küçük olamaz.', { count });
  }
}

export class InsufficientFundsException extends DomainException {
  readonly errorCode = ERROR_CODES.MONEY.INSUFFICIENT_FUNDS;
  public override readonly httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor() {
    super('Yetersiz bakiye: İşlem sonucu negatif olamaz.');
  }
}

export class CurrencyMismatchException extends DomainException<{
  expected?: string;
  actual?: string;
}> {
  readonly errorCode = ERROR_CODES.MONEY.CURRENCY_MISMATCH;
  public override readonly httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor(expected?: string, actual?: string) {
    super(
      `Para birimi uyuşmazlığı: ${expected} ile ${actual} işleme giremez.`,
      {
        expected,
        actual,
      }
    );
  }
}
