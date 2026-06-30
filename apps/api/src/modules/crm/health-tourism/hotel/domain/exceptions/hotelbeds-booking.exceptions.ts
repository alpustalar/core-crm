import { ERROR_CODES } from '@common/constants/error-codes.constant';
import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@src/domain/exceptions/domain.exception';

export class HotelbedsBookingAlreadyCancelledException extends DomainException<{
  bookingReference?: string;
}> {
  readonly errorCode = ERROR_CODES.HOTELBEDS_BOOKING.ALREADY_CANCELLED;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(bookingReference?: string) {
    super(`Hotelbeds rezervasyonu zaten iptal edilmiş.`, {
      bookingReference,
    });
  }
}

export class HotelbedsBookingNotFoundException extends DomainException<{
  bookingReference?: string;
}> {
  readonly errorCode = ERROR_CODES.HOTELBEDS_BOOKING.NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor() {
    super('Hotelbeds rezervasyonu bulunamadı.');
  }
}
