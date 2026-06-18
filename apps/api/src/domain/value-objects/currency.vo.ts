import { BadRequestException } from '@nestjs/common';
import {
  CurrencySchema,
  CurrencyType,
} from '@input-type-schemas/CurrencySchema';

export class Currency {
  private readonly _value: CurrencyType;

  private constructor(value: CurrencyType) {
    this._value = value;
  }

  // Value Object: Getter
  public get value(): CurrencyType {
    return this._value;
  }

  public static create(currencyStr: string | undefined | null): Currency {
    if (!currencyStr) {
      return new Currency(CurrencySchema.enum.TRY);
    }

    const normalized = currencyStr.trim().toUpperCase();
    const result = CurrencySchema.safeParse(normalized);

    if (!result.success) {
      throw new BadRequestException(`Geçersiz para birimi: ${currencyStr}`);
    }

    return new Currency(result.data);
  }

  public equals(other: Currency): boolean {
    return other instanceof Currency && this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
