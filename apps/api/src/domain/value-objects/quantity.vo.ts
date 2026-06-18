import { Decimal } from 'decimal.js';
import { BadRequestException } from '@nestjs/common';

export class Quantity {
  private readonly _value: Decimal;

  private constructor(value: Decimal) {
    this._value = value;
  }

  public get value(): Decimal {
    return this._value;
  }

  public static create(value: number | string | Decimal): Quantity {
    const decimal = new Decimal(value);
    if (decimal.isNegative()) {
      throw new BadRequestException('Miktar negatif olamaz.');
    }
    return new Quantity(decimal);
  }

  public add(other: Quantity): Quantity {
    return new Quantity(this._value.add(other.value));
  }

  public sub(other: Quantity): Quantity {
    if (this._value.lessThan(other.value)) {
      throw new BadRequestException('Yetersiz miktar.');
    }
    return new Quantity(this._value.sub(other.value));
  }
}
