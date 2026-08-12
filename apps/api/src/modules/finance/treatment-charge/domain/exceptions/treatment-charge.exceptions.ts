import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@src/domain/exceptions/domain.exception';
import { ERROR_CODES } from '@common/constants/error-codes.constant';
import type { DiscountLimitMeta } from '@shared/modules/treatment-charge/interfaces';

export class TreatmentChargeNotFoundException extends DomainException {
  public readonly errorCode = ERROR_CODES.TREATMENT_CHARGE.NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(chargeId?: string) {
    super(
      chargeId
        ? `İşlem satırı bulunamadı: ${chargeId}`
        : 'İşlem satırı bulunamadı.'
    );
  }
}

/**
 * Tedavinin liste fiyatı tanımlı değilken satır açılmaya çalışıldı. İndirim
 * ölçülebilir olsun diye satır her zaman bir referans fiyatla doğar.
 */
export class TreatmentListPriceMissingException extends DomainException {
  public readonly errorCode = ERROR_CODES.TREATMENT_CHARGE.LIST_PRICE_MISSING;

  constructor(treatmentId: string) {
    super(
      `Tedavinin liste fiyatı tanımlı değil, ücretlendirilemez: ${treatmentId}`
    );
  }
}

/**
 * İndirim klinik tavanını aştı. Frontend'in "onay iste" akışını kurabilmesi için
 * istenen ve izin verilen oranları `meta` ile taşır.
 */
export class DiscountLimitExceededException extends DomainException<DiscountLimitMeta> {
  public readonly errorCode =
    ERROR_CODES.TREATMENT_CHARGE.DISCOUNT_LIMIT_EXCEEDED;
  public override readonly httpStatus = HttpStatus.FORBIDDEN;

  constructor(meta: DiscountLimitMeta) {
    super(
      `İndirim oranı klinik sınırını aşıyor (istenen %${meta.requestedRate}, izin verilen %${meta.maxAllowedRate}). Bu indirimi yalnız klinik yöneticisi onaylayabilir.`,
      meta
    );
  }
}

export class TreatmentChargeAlreadyVoidedException extends DomainException {
  public readonly errorCode = ERROR_CODES.TREATMENT_CHARGE.ALREADY_VOIDED;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(chargeId: string) {
    super(`İşlem satırı zaten iptal edilmiş: ${chargeId}`);
  }
}

/**
 * Faturası kesilmiş randevunun satırı değiştirilemez — ticari belge dondu.
 */
export class TreatmentChargeAlreadyInvoicedException extends DomainException {
  public readonly errorCode = ERROR_CODES.TREATMENT_CHARGE.ALREADY_INVOICED;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(appointmentId: string) {
    super(
      `Faturası kesilmiş randevunun işlem satırları değiştirilemez: ${appointmentId}`
    );
  }
}

/**
 * Fatura başlığı tek KDV oranı taşır (`Invoice.vatRate`); bu yüzden bir
 * randevunun satırları farklı oran taşıyamaz.
 */
export class MixedVatRateException extends DomainException {
  public readonly errorCode = ERROR_CODES.TREATMENT_CHARGE.MIXED_VAT_RATE;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(appointmentId: string) {
    super(
      `Randevunun işlem satırları farklı KDV oranları taşıyor, tek faturada birleştirilemez: ${appointmentId}`
    );
  }
}

export class ChargeCurrencyMismatchException extends DomainException {
  public readonly errorCode = ERROR_CODES.TREATMENT_CHARGE.CURRENCY_MISMATCH;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(appointmentId: string) {
    super(
      `Randevunun işlem satırları farklı para birimleri taşıyor: ${appointmentId}`
    );
  }
}

export class NoChargesForAppointmentException extends DomainException {
  public readonly errorCode = ERROR_CODES.TREATMENT_CHARGE.NO_CHARGES;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(appointmentId: string) {
    super(`Randevunun ücretlendirilmiş işlem satırı yok: ${appointmentId}`);
  }
}
