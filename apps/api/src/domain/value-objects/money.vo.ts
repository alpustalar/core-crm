import { Decimal } from 'decimal.js';
import { z } from 'zod';
import {
  CurrencySchema,
  CurrencyType,
} from '@input-type-schemas/CurrencySchema';
import {
  CurrencyMismatchException,
  InsufficientFundsException,
  InvalidAllocationCountException,
  InvalidMoneyAmountException,
} from '@src/domain/exceptions/money.exceptions';
import { isEmpty } from '@common/utils';

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

  private readonly _value: Decimal;
  private readonly _currency: CurrencyType;

  private constructor(amount: Decimal, currency: CurrencyType) {
    this._value = amount;
    this._currency = currency;
    Object.freeze(this);
  }

  /**
   * 🎯 2. Static Validate (Getter): Sınıf düzeyinde ham verinin şemaya uygunluğunu doğrular
   * Örn: Money.validate.input(dto.amount, dto.currency).orThrow()
   */
  public static get validate() {
    return {
      input: (amount: string | number | Decimal, currency: CurrencyType) => {
        const decimalAmount =
          amount instanceof Decimal ? amount : new Decimal(amount);
        const normalizedCurrency = currency?.trim().toUpperCase();

        const result = Money.schema.safeParse({
          amount: decimalAmount,
          currency: normalizedCurrency,
        });

        return {
          isValid: result.success,
          isInvalid: !result.success,
          orThrow: (exception?: Error) => {
            if (!result.success) {
              throw (
                exception ??
                new InvalidMoneyAmountException(result.error.message)
              );
            }
            return result.data;
          },
        };
      },
    };
  }

  public get value(): Decimal {
    return this._value;
  }

  public get currency(): CurrencyType {
    return this._currency;
  }

  public get validate() {
    return {
      greaterThanZero: (() => {
        const isGreaterThanZero =
          this.value.isPositive() && !this.value.isZero();
        return {
          isValid: isGreaterThanZero,
          orThrow: (message?: string): Money => {
            if (!isGreaterThanZero) {
              throw new InvalidMoneyAmountException(message);
            }
            return this;
          },
        };
      })(),
    };
  }

  public static fromTrusted(
    amount: number | string | Decimal,
    currency: CurrencyType
  ): Money {
    return new Money(
      amount instanceof Decimal ? amount : new Decimal(amount),
      currency
    );
  }

  public static create(
    amount: number | string | Decimal | null | undefined,
    currencyStr: CurrencyType
  ) {
    const isBlank = isEmpty(amount);

    const validated = isBlank
      ? false
      : Money.validate.input(amount, currencyStr).isValid;

    const normalizeAmount = amount ? new Decimal(amount) : null;

    const instance =
      validated && normalizeAmount
        ? new Money(normalizeAmount, currencyStr)
        : undefined;

    return {
      instance,

      orThrow(exception?: Error): Money {
        if (!validated || !instance) {
          throw exception ?? new InvalidMoneyAmountException();
        }
        return instance;
      },
    };
  }

  public toApiFormat(): string {
    return this._value.toFixed(2);
  }

  public applyPercentage(percentage: number | string | Decimal): Money {
    const p = new Decimal(percentage).div(100);
    const increase = this._value.mul(p);
    return new Money(this._value.add(increase), this._currency);
  }

  public allocate(count: number): Money[] {
    if (count <= 0) {
      throw new InvalidAllocationCountException(count);
    }
    const total = this._value;
    const each = total.div(count).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const remainder = total.sub(each.mul(count));

    const results = Array.from(
      { length: count },
      () => new Money(each, this._currency)
    );

    if (!remainder.isZero()) {
      results[0] = new Money(results[0].value.add(remainder), this._currency);
    }

    return results;
  }

  public format(locale: string = 'tr-TR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this._currency,
    }).format(this._value.toNumber());
  }

  public add(other: Money): Money {
    this.checkCurrencyMatch(other);
    return new Money(this._value.add(other._value), this._currency);
  }

  public isGreaterThan(other: Money): boolean {
    this.checkCurrencyMatch(other);
    return this._value.greaterThan(other._value);
  }

  public subtract(other: Money): Money {
    this.checkCurrencyMatch(other);
    const result = this._value.sub(other._value);

    if (result.isNegative()) {
      throw new InsufficientFundsException();
    }
    return new Money(result, this._currency);
  }

  public multiply(quantity: number | Decimal): Money {
    const q = new Decimal(quantity);
    return new Money(this._value.mul(q), this._currency);
  }

  public calculateVat(vatRate: number | string | Decimal): Money {
    const rate = new Decimal(vatRate).div(100);
    return new Money(this._value.mul(rate), this._currency);
  }

  public equals(other: Money): boolean {
    return (
      this._currency === other._currency && this._value.equals(other._value)
    );
  }

  private checkCurrencyMatch(other: Money): void {
    if (this._currency !== other._currency) {
      throw new CurrencyMismatchException(this.currency, other.currency);
    }
  }
}
