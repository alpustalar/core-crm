import { BadRequestException } from '@nestjs/common';
import { Money } from '@src/domain/value-objects/money.vo';
import { z } from 'zod';
import { Decimal } from 'decimal.js';

export class TaxSpecification {
  private static readonly rateSchema = z
    .number()
    .min(0)
    .max(100, 'Vergi oranı 0-100 arasında olmalıdır.');

  private static readonly createSchema = z
    .object({
      // z.instanceof yerine z.custom kullanıyoruz
      netAmount: z.custom<Money>((val) => val instanceof Money, {
        message: 'Geçersiz para nesnesi.',
      }),
      taxRate: this.rateSchema,
      customTaxAmount: z
        .custom<Money>((val) => val instanceof Money)
        .optional(),
    })
    .refine(
      (data) => {
        if (!data.customTaxAmount) return true;
        const calculatedTax = data.netAmount.amount.mul(data.taxRate).div(100);
        const diff = data.customTaxAmount.amount.minus(calculatedTax).abs();
        return diff.lte(0.02);
      },
      { message: 'Vergi tutarı uyuşmuyor.', path: ['customTaxAmount'] }
    );

  private readonly _netAmount: Money;
  private readonly _taxRate: number;
  private readonly _taxAmount: Money;

  private constructor(netAmount: Money, taxRate: number, taxAmount: Money) {
    this._netAmount = netAmount;
    this._taxRate = taxRate;
    this._taxAmount = taxAmount;
  }

  public get netAmount(): Money {
    return this._netAmount;
  }
  public get taxRate(): number {
    return this._taxRate;
  }
  public get taxAmount(): Money {
    return this._taxAmount;
  }
  public get grossAmount(): Money {
    return this._netAmount.add(this._taxAmount);
  }

  public static create(
    netAmount: Money,
    taxRate: number,
    customTaxAmount?: Money
  ): TaxSpecification {
    const result = this.createSchema.safeParse({
      netAmount,
      taxRate,
      customTaxAmount,
    });

    if (!result.success) {
      throw new BadRequestException(result.error.issues[0].message);
    }

    const calculatedTax = netAmount.amount.mul(taxRate).div(100);
    const taxMoney = Money.create(calculatedTax, netAmount.currency).orThrow();

    return new TaxSpecification(
      netAmount,
      taxRate,
      customTaxAmount ?? taxMoney
    );
  }

  public static fromGrossAmount(
    grossAmount: Money,
    vatRate: number
  ): TaxSpecification {
    const rateResult = this.rateSchema.safeParse(vatRate);
    if (!rateResult.success) {
      throw new BadRequestException(rateResult.error.issues[0].message);
    }

    const divisor = new Decimal(1).plus(new Decimal(vatRate).div(100));
    const netValue = grossAmount.amount.div(divisor).toDecimalPlaces(2);
    const vatValue = grossAmount.amount.minus(netValue);

    return new TaxSpecification(
      Money.create(netValue, grossAmount.currency).orThrow(),
      vatRate,
      Money.create(vatValue, grossAmount.currency).orThrow()
    );
  }
}
