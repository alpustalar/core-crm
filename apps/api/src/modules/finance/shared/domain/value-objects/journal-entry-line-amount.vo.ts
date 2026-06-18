import { BadRequestException } from '@nestjs/common'; // Eğer domain dışı hata kullanıyorsan kalsın, yoksa saf Error'a çekersin
import { z } from 'zod';
import { Decimal } from 'decimal.js';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';

export class JournalEntryLineAmount {
  private static readonly schema = z
    .object({
      debit: z.instanceof(Decimal),
      credit: z.instanceof(Decimal),
      currency: CurrencySchema,
    })
    .refine((data) => data.debit.gte(0) && data.credit.gte(0), {
      message: 'Muhasebe satır tutarı negatif olamaz.',
    })
    .refine((data) => !(data.debit.gt(0) && data.credit.gt(0)), {
      message:
        'Bir yevmiye satırında aynı anda hem Borç hem Alacak tutarı bulunamaz.',
    })
    .refine((data) => !data.debit.isZero() || !data.credit.isZero(), {
      message:
        'Yevmiye satırında borç veya alacak alanlarından en az biri sıfırdan büyük olmalıdır.',
    });

  private readonly _debit: Decimal;
  private readonly _credit: Decimal;
  private readonly _currency: Currency;

  private constructor(debit: Decimal, credit: Decimal, currency: Currency) {
    this._debit = debit;
    this._credit = credit;
    this._currency = currency;
  }

  public get debit(): Decimal {
    return this._debit;
  }
  public get credit(): Decimal {
    return this._credit;
  }
  public get currency(): Currency {
    return this._currency;
  }

  public static create(
    debit: Decimal,
    credit: Decimal,
    currency: Currency
  ): JournalEntryLineAmount {
    const result = this.schema.safeParse({
      debit,
      credit,
      currency: currency.value,
    });

    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }

    return new JournalEntryLineAmount(
      result.data.debit,
      result.data.credit,
      currency
    );
  }

  public getAmount(): Decimal {
    return this._debit.gt(0) ? this._debit : this._credit;
  }

  public isDebit(): boolean {
    return this._debit.gt(0);
  }

  public equals(other: JournalEntryLineAmount): boolean {
    return (
      this._debit.equals(other.debit) &&
      this._credit.equals(other.credit) &&
      this._currency.equals(other.currency) // VO'nun kendi equals metodunu tetikliyoruz
    );
  }
}
