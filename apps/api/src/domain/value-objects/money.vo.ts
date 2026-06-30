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
} from '@src/domain/exceptions/vo/money.exceptions';

// Derleyicinin (TSC) context'i kaçırmasını önleyen validator arayüzleri
interface IMoneyPublicValidator {
  greaterThanZero: {
    isValid: boolean;
    isInvalid: boolean;
    orThrow: (message?: string) => Money;
  };
}

interface IMoneyStaticValidator {
  input: (
    amount: any,
    currency: any
  ) => {
    isValid: boolean;
    isInvalid: boolean;
    orThrow: (exception?: Error) => { amount: Decimal; currency: CurrencyType };
  };
}

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
    Object.freeze(this);
  }

  /**
   * 🎯 2. Static Validate (Getter): Sınıf düzeyinde ham verinin şemaya uygunluğunu doğrular
   * Örn: Money.validate.input(dto.amount, dto.currency).orThrow()
   */
  public static get validate(): IMoneyStaticValidator {
    return {
      input: (amount: any, currency: any) => {
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
              throw exception ?? new InvalidMoneyAmountException(result.error.message);
            }
            return result.data;
          },
        };
      },
    };
  }

  public get amount(): Decimal {
    return this._amount;
  }

  public get currency(): CurrencyType {
    return this._currency;
  }

  /**
   * 🎯 1. Public Validate (Getter): Nesne oluştuktan sonraki iş kuralları barikatı
   * Örn: price.validate.greaterThanZero.orThrow()
   */
  public get validate(): IMoneyPublicValidator {
    const self = this;
    const isGreaterThanZero =
      self._amount.isPositive() && !self._amount.isZero();

    return {
      greaterThanZero: {
        isValid: isGreaterThanZero,
        isInvalid: !isGreaterThanZero,
        orThrow: (message?: string): Money => {
          if (!isGreaterThanZero) {
            throw new InvalidMoneyAmountException(message);
          }
          return self;
        },
      },
    };
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) tutar + para biriminden doğrudan VO üretir;
   * şema doğrulaması atlanır. Sadece güvendiğin (persisted) veride kullan.
   */
  public static fromTrusted(
    amount: number | string | Decimal,
    currency: CurrencyType
  ): Money {
    return new Money(
      amount instanceof Decimal ? amount : new Decimal(amount),
      currency
    );
  }

  /**
   * 🎯 Akıllı Factory: Projedeki yeni "instance" ve "orThrow" standart ordu nizamımız
   */
  public static create(
    amount: number | string | Decimal | null | undefined,
    currencyStr: CurrencyType
  ) {
    const isBlank = amount === null || amount === undefined || amount === '';

    let instance: Money | undefined;
    let error: Error | undefined;

    if (!isBlank) {
      try {
        // İçerideki tüm şema doğrulamalarını statik validate metodumuz üzerinden yürütüyoruz
        const validated = Money.validate.input(amount, currencyStr).orThrow();
        instance = new Money(validated.amount, validated.currency);
      } catch (e: any) {
        error = e;
      }
    }

    return {
      /**
       * ➔ Opsiyonel Senaryo: Hatalı veya boşsa undefined döner, akışı kesmez.
       */
      instance: error ? undefined : instance,

      /**
       * ➔ Zorunlu Senaryo: Hatalı kur veya miktar sızmaya çalışırsa küt diye patlatır.
       */
      orThrow(exception?: Error): Money {
        if (error || !instance) {
          throw exception ?? error ?? new InvalidMoneyAmountException();
        }
        return instance;
      },
    };
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
      throw new InvalidAllocationCountException(count);
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
      throw new InsufficientFundsException();
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
      throw new CurrencyMismatchException(this.currency, other.currency);
    }
  }
}
