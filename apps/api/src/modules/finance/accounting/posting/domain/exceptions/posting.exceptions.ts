import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@src/domain/exceptions';
import { ERROR_CODES } from '@common/constants/error-codes.constant';

export interface PlatformBookingAmountsMismatchMeta
  extends Record<string, unknown> {
  saleAmount: string;
  supplierAmount: string;
  commission: string;
}

/**
 * Tahsilat tutarları kendi içinde tutarsız (komisyon + tedarikçi payı ≠ brüt).
 * Dengesiz fiş yazıp mizanı sessizce bozmaktansa burada durulur.
 */
export class PlatformBookingAmountsMismatchException extends DomainException<PlatformBookingAmountsMismatchMeta> {
  public readonly errorCode =
    ERROR_CODES.POSTING.PLATFORM_BOOKING_AMOUNTS_MISMATCH;

  constructor(meta: PlatformBookingAmountsMismatchMeta) {
    super(
      'Rezervasyon tahsilat tutarları tutarsız: komisyon + tedarikçi payı brüt tutara eşit değil.',
      meta
    );
  }
}

/**
 * Platform kiracısı (isPlatform) bulunamadı — komisyon postlanacak defter yok.
 * Migration bu satırları kurar; yoksa kurulum eksiktir.
 */
export class PlatformTenantNotConfiguredException extends DomainException {
  public readonly errorCode = ERROR_CODES.POSTING.PLATFORM_TENANT_NOT_CONFIGURED;
  public override readonly httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

  constructor() {
    super(
      'Platform kiracısı bulunamadı (isPlatform). Sağlık turizmi komisyonu ' +
        'postlanamaz — platform organizasyonu ve kliniği kurulmalı.'
    );
  }
}
