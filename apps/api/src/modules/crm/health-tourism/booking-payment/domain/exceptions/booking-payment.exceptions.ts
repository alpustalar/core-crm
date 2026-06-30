import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@src/domain/exceptions/domain.exception';
import { ERROR_CODES } from '@common/constants/error-codes.constant';

export class BookingPaymentNotFoundException extends DomainException {
  public readonly errorCode = ERROR_CODES.BOOKING_PAYMENT.NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(message = 'Ödeme kaydı bulunamadı.') {
    super(message);
  }
}

export class BookingPaymentLinkGenerationException extends DomainException {
  public readonly errorCode = ERROR_CODES.BOOKING_PAYMENT.LINK_GENERATION_FAILED;

  constructor(
    message = 'Ödeme linki üretilemedi. Lütfen daha sonra tekrar deneyin.'
  ) {
    super(message);
  }
}
