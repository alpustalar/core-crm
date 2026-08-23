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

/**
 * Fişin düşeceği muhasebe dönemi yok.
 *
 * Posting hattındaki bu koşullar önceden `throw new Error(...)` idi: hepsi 500
 * dönüyordu ve `errorCode` taşımadıkları için arayüz "dönem açılmamış" ile
 * "fiş dengesiz"i ayırt edemiyordu. İkisi de operatörün farklı aksiyon aldığı
 * durumlar.
 */
export class NoAccountingPeriodForDateException extends DomainException<{
  date: string;
}> {
  public readonly errorCode = ERROR_CODES.POSTING.NO_PERIOD_FOR_DATE;
  public override readonly httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor(date: Date) {
    super(
      `${date.toISOString()} tarihi için muhasebe dönemi yok; önce dönem açın.`,
      { date: date.toISOString() }
    );
  }
}

/** Hedef dönem kapalı/kilitli — fiş atılamaz. */
export class PeriodNotOpenForPostingException extends DomainException<{
  year: number;
  status: string;
}> {
  public readonly errorCode = ERROR_CODES.POSTING.PERIOD_NOT_OPEN;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(year: number, status: string) {
    super(`Dönem ${year} kapalı/kilitli; fiş atılamaz.`, { year, status });
  }
}

/**
 * Borç ≠ alacak. Bu fişin yazılmasına izin vermek mizanı sessizce bozardı;
 * hata mesajı yerine tutarları da taşır ki fark ekranda görünsün.
 */
export class UnbalancedJournalEntryException extends DomainException<{
  totalDebit: string;
  totalCredit: string;
}> {
  public readonly errorCode = ERROR_CODES.POSTING.UNBALANCED_ENTRY;
  public override readonly httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor(totalDebit: string, totalCredit: string) {
    super(
      'Yevmiye fişi borç ve alacak toplamları eşit olmalıdır. Mizan tutarsızlığı engellendi.',
      { totalDebit, totalCredit }
    );
  }
}

/** Yaprak olmayan (ara/başlık) hesaba fiş atılamaz. */
export class AccountNotPostableException extends DomainException<{
  accountCode: string;
}> {
  public readonly errorCode = ERROR_CODES.POSTING.ACCOUNT_NOT_POSTABLE;
  public override readonly httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor(accountCode: string) {
    super(`Yaprak olmayan hesaba fiş atılamaz: ${accountCode}`, {
      accountCode,
    });
  }
}

/** Alt defter (cari/party) zorunlu olan hesapta party verilmemiş. */
export class PartyRequiredForAccountException extends DomainException<{
  accountCode: string;
}> {
  public readonly errorCode = ERROR_CODES.POSTING.PARTY_REQUIRED;
  public override readonly httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor(accountCode: string) {
    super(`${accountCode} hesabında alt defter (party) zorunludur.`, {
      accountCode,
    });
  }
}

/** Posting kuralının istediği hesap kodu klinik hesap planında yok. */
export class AccountCodeNotFoundException extends DomainException<{
  accountCode: string;
}> {
  public readonly errorCode = ERROR_CODES.POSTING.ACCOUNT_CODE_NOT_FOUND;
  public override readonly httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor(accountCode: string) {
    super(`Hesap planında kod bulunamadı: ${accountCode}`, { accountCode });
  }
}
