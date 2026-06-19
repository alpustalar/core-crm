import { BadRequestException } from '@nestjs/common';
import { Decimal } from 'decimal.js';

export class VatRate {
  // Türkiye'deki yasal KDV oranları (2026 güncel mevzuat)
  private static readonly VALID_RATES = [0, 1, 10, 20];
  private readonly _value: Decimal;

  private constructor(value: Decimal) {
    this._value = value;
  }

  public get value(): Decimal {
    return this._value;
  }

  public get asMultiplier(): Decimal {
    // Örn: %20 için 0.20 döner, fatura matrah hesaplamalarında doğrudan kullanılır
    return this._value.div(100);
  }

  public get asTaxMultiplier(): Decimal {
    // Örn: %20 için 1.20 döner, brütleştirme işlemlerinde kullanılır
    return new Decimal(1).plus(this.asMultiplier);
  }

  public static create(value: number | Decimal | null | undefined): VatRate {
    // Eğer KDV belirtilmemişse varsayılan olarak %0 (Muaf/Dahil değil) kabul edebiliriz
    if (value === null || value === undefined) {
      return new VatRate(new Decimal(0));
    }

    const decimalValue = value instanceof Decimal ? value : new Decimal(value);

    // Kural 1: Negatif değer kontrolü
    if (decimalValue.isNeg()) {
      throw new BadRequestException('KDV oranı negatif olamaz.');
    }

    // Kural 2: Yasal oran kontrolü (İsteğe bağlı ama finansal disiplin için çok güçlüdür)
    const rateAsNumber = decimalValue.toNumber();
    if (!this.VALID_RATES.includes(rateAsNumber)) {
      throw new BadRequestException(
        `Geçersiz KDV oranı: %${rateAsNumber}. Yasal oranlar: %0, %1, %10, %20`
      );
    }

    return new VatRate(decimalValue);
  }

  public isZero(): boolean {
    return this._value.isZero();
  }

  public validateHasTaxOrThrow(errorMessage?: string): void {
    if (this.isZero()) {
      throw new BadRequestException(
        errorMessage ||
          'Bu işlem için KDV oranı %0 (muaf) olamaz, geçerli bir KDV oranı girilmelidir.'
      );
    }
  }
}
