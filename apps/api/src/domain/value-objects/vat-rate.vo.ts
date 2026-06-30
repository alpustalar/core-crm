import { Decimal } from 'decimal.js';
import {
  InvalidVatRateException,
  VatRateMustNotBeZeroException,
  VatRateNegativeException,
} from '@src/domain/exceptions/vo/vat-rate.exceptions';

interface IVatRateValidator {
  hasTax: {
    isValid: boolean;
    isInvalid: boolean;
    orThrow: (exception?: Error) => VatRate;
  };
}

export class VatRate {
  // 🇹🇷 Türkiye 2026 güncel yasal KDV oranları (%0, %1, %10, %20)
  private static readonly VALID_RATES = [0, 1, 10, 20];
  private readonly _value: Decimal;

  private constructor(value: Decimal) {
    this._value = value;
    Object.freeze(this);
  }

  public get value(): Decimal {
    return this._value;
  }

  public get asMultiplier(): Decimal {
    // Örn: %20 için 0.20 döner (Matrah hesaplamalarında direkt çarpım için)
    return this._value.div(100);
  }

  public get asTaxMultiplier(): Decimal {
    // Örn: %20 için 1.20 döner (Brütleştirme / KDV dahil tutar hesaplamalarında)
    return new Decimal(1).plus(this.asMultiplier);
  }

  public get validate(): IVatRateValidator {
    // Sinsi 'this' kaybolmalarını önlemek için instance referansını sabitliyoruz
    const self = this;
    const isZeroRate = self.isZero();

    return {
      hasTax: {
        isValid: !isZeroRate,
        isInvalid: isZeroRate,
        orThrow: (exception?: Error): VatRate => {
          if (isZeroRate) {
            throw exception ?? new VatRateMustNotBeZeroException();
          }
          return self;
        },
      },
    };
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) KDV oranından doğrudan VO üretir; yasal-oran
   * doğrulaması atlanır. Sadece güvendiğin (persisted) veride kullan.
   */
  public static fromTrusted(value: number | string | Decimal): VatRate {
    return new VatRate(value instanceof Decimal ? value : new Decimal(value));
  }

  /**
   * 🎯 Akıllı Factory: Yeni "instance" ve "orThrow" standart ordu nizamımız
   */
  public static create(value: number | Decimal | null | undefined) {
    // KDV belirtilmemişse varsayılan olarak %0 (KDV Muaf) nesnesini güvenle hazırlarız
    const isBlank = value === null || value === undefined;
    const finalValue = isBlank
      ? new Decimal(0)
      : value instanceof Decimal
        ? value
        : new Decimal(value);

    let instance: VatRate | undefined;
    let error: Error | undefined;

    try {
      // 1. Negatif değer barikatı
      if (finalValue.isNeg()) {
        throw new VatRateNegativeException();
      }

      // 2. Yasal oran kontrolü
      const rateAsNumber = finalValue.toNumber();
      if (!VatRate.VALID_RATES.includes(rateAsNumber)) {
        throw new InvalidVatRateException(rateAsNumber);
      }

      instance = new VatRate(finalValue);
    } catch (e: any) {
      error = e;
    }

    return {
      /**
       * ➔ Opsiyonel Senaryo: Hata varsa undefined, yoksa VatRate nesnesi döner.
       */
      instance: error ? undefined : instance,

      /**
       * ➔ Zorunlu Senaryo: Hatalı veya illegal bir oran geldiyse küt diye patlatır.
       */
      orThrow(exception?: Error): VatRate {
        if (error || !instance) {
          throw exception ?? error ?? new VatRateNegativeException();
        }
        return instance;
      },
    };
  }

  public isZero(): boolean {
    return this._value.isZero();
  }

  public equals(other: VatRate): boolean {
    return this._value.equals(other.value);
  }

  public toString(): string {
    return `%${this._value.toString()}`;
  }
}
