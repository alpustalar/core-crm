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

/**
 * Rezervasyon varsayılan olarak ödeme-önce (payment-first) saga üzerinden açılır:
 * müşteri ödemeden HotelBeds'e rezervasyon (dolayısıyla acente maliyeti/borcu) oluşmaz.
 * Direkt booking endpoint'i yalnızca ödemenin kanal dışı tahsil edildiği MANUEL override
 * ile kullanılabilir (personel bilinçli tercihi). Bunun için `manualOverride: true` gönderilir.
 */
export class ManualBookingOverrideRequiredException extends DomainException {
  public readonly errorCode = ERROR_CODES.BOOKING_PAYMENT.MANUAL_OVERRIDE_REQUIRED;
  public override readonly httpStatus = HttpStatus.PAYMENT_REQUIRED;

  constructor(
    message = 'Rezervasyon için önce ödeme alınmalıdır. Ödemesi kanal dışı tahsil edildiyse manuel booking için manualOverride=true gönderin.'
  ) {
    super(message);
  }
}
