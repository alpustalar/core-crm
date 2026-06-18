import { BadRequestException } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { z } from 'zod';
import {
  CurrencySchema,
  CurrencyType,
} from '@input-type-schemas/CurrencySchema';

export class Money {
  static readonly PRECISION = 2;
  private static readonly schema = z
    .object({
      amount: z.custom<Decimal>((val) => val instanceof Decimal),
      currency: CurrencySchema,
    })
    .refine((data) => !data.amount.isNegative(), {
      message: 'Para miktarı negatif olamaz.',
    });

  private readonly _amount: Decimal;
  private readonly _currency: CurrencyType;

  private constructor(amount: Decimal, currency: CurrencyType) {
    this._amount = amount;
    this._currency = currency;
  }

  public get amount(): Decimal {
    return this._amount;
  }

  public get currency(): CurrencyType {
    return this._currency;
  }

  public static create(
    amount: number | string | Decimal,
    currencyStr: CurrencyType
  ): Money {
    const decimalAmount =
      amount instanceof Decimal ? amount : new Decimal(amount);
    const normalizedCurrency = currencyStr?.trim().toUpperCase();

    const result = this.schema.safeParse({
      amount: decimalAmount,
      currency: normalizedCurrency,
    });

    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }

    return new Money(result.data.amount, result.data.currency);
  }

  public isGreaterThanZero(): boolean {
    return this._amount.isPositive() && !this._amount.isZero();
  }

  public validateGreaterThanZeroOrThrow(errorMessage?: string): void {
    if (!this.isGreaterThanZero()) {
      throw new BadRequestException(
        errorMessage || 'Finansal işlem tutarı sıfırdan büyük olmak zorundadır.'
      );
    }
  }

  public toApiFormat(): string {
    return this._amount.toFixed(2);
  }

  public applyPercentage(percentage: number | string | Decimal): Money {
    const p = new Decimal(percentage).div(100);
    const increase = this._amount.mul(p);
    return new Money(this._amount.add(increase), this._currency);
  }

  public allocate(count: number): Money[] {
    if (count <= 0) {
      throw new BadRequestException(
        'Paylaştırma sayısı 0 veya daha küçük olamaz.'
      );
    }
    const total = this._amount;
    const each = total.div(count).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const remainder = total.sub(each.mul(count));

    const results = Array.from(
      { length: count },
      () => new Money(each, this._currency)
    );

    if (!remainder.isZero()) {
      results[0] = new Money(results[0].amount.add(remainder), this._currency);
    }

    return results;
  }
  public format(locale: string = 'tr-TR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this._currency,
    }).format(this._amount.toNumber());
  }

  public add(other: Money): Money {
    this.checkCurrencyMatch(other);
    return new Money(this._amount.add(other._amount), this._currency);
  }

  public isGreaterThan(other: Money): boolean {
    this.checkCurrencyMatch(other);
    return this._amount.greaterThan(other._amount);
  }

  public subtract(other: Money): Money {
    this.checkCurrencyMatch(other);
    const result = this._amount.sub(other._amount);

    if (result.isNegative()) {
      throw new BadRequestException(
        'Yetersiz bakiye: İşlem sonucu negatif olamaz.'
      );
    }
    return new Money(result, this._currency);
  }

  public multiply(quantity: number | Decimal): Money {
    const q = new Decimal(quantity);
    return new Money(this._amount.mul(q), this._currency);
  }

  public calculateVat(vatRate: number | string | Decimal): Money {
    const rate = new Decimal(vatRate).div(100);
    return new Money(this._amount.mul(rate), this._currency);
  }

  public equals(other: Money): boolean {
    return (
      this._currency === other._currency && this._amount.equals(other._amount)
    );
  }

  private checkCurrencyMatch(other: Money): void {
    if (this._currency !== other._currency) {
      throw new BadRequestException(
        `Para birimi uyuşmazlığı: ${this._currency} ile ${other._currency} işleme giremez.`
      );
    }
  }
}
