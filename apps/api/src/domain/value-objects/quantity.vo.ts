import { Decimal } from 'decimal.js';
import { BadRequestException } from '@nestjs/common';

export class Quantity {
  private readonly _value: Decimal;
  private readonly _name: string | undefined;
  private constructor(value: Decimal, name?: string) {
    this._value = value;
    this._name = name;
  }

  public get value(): Decimal {
    return this._value;
  }

  public get name(): string | undefined {
    return this._name;
  }

  public static create(
    value: number | string | Decimal,
    context?: string
  ): Quantity {
    const decimal = new Decimal(value);
    if (decimal.isNegative()) {
      throw new BadRequestException(
        context ? `${context} miktarı negatif olamaz.` : 'Miktar negatif olamaz'
      );
    }
    return new Quantity(decimal, context);
  }

  public static createPositive(
    value: number | string | Decimal,
    context?: string
  ): Quantity {
    const qty = Quantity.create(value, context);
    qty.validateGreaterThanZeroOrThrow();
    return qty;
  }

  public static isDeltaAnIncrease(
    deltaValue: number | string | Decimal
  ): boolean {
    const delta =
      deltaValue instanceof Decimal ? deltaValue : new Decimal(deltaValue);
    return delta.greaterThan(0);
  }

  public static createAbsFromDelta(
    deltaValue: number | string | Decimal,
    context?: string
  ): Quantity {
    const delta =
      deltaValue instanceof Decimal ? deltaValue : new Decimal(deltaValue);
    return new Quantity(delta.abs(), context);
  }

  public validateGreaterThanZeroOrThrow(): void {
    if (this._value.lessThanOrEqualTo(0)) {
      throw new BadRequestException(
        this._name
          ? `${this._name} miktarı sıfırdan büyük olmalıdır.`
          : 'Miktar sıfırdan büyük olmalıdır.'
      );
    }
  }

  public add(other: Quantity): Quantity {
    return new Quantity(this._value.add(other.value), this._name);
  }

  public plus(other: Quantity): Quantity {
    return new Quantity(this._value.plus(other.value), this._name);
  }

  public sub(other: Quantity): Quantity {
    if (this._value.lessThan(other.value)) {
      throw new BadRequestException(
        this._name ? `${this._name} için yetersiz miktar.` : 'Yetersiz miktar.'
      );
    }
    return new Quantity(this._value.sub(other.value), this._name);
  }

  public applyDelta(deltaValue: number | string | Decimal): Quantity {
    const delta =
      deltaValue instanceof Decimal ? deltaValue : new Decimal(deltaValue);
    const newValue = this._value.plus(delta);

    if (newValue.isNegative()) {
      throw new BadRequestException(
        this._name
          ? `${this._name} yetersiz. Mevcut: ${this._value.toString()}, Düşülmek İstenen: ${delta.abs().toString()}`
          : `Stok yetersiz. Mevcut: ${this._value.toString()}, Düşülmek İstenen: ${delta.abs().toString()}`
      );
    }

    return new Quantity(newValue, this._name);
  }
}
