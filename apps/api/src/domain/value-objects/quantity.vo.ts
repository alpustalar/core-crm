import { Decimal } from 'decimal.js';
import {
  QuantityInsufficientException,
  QuantityNegativeException,
  QuantityNotGreaterThanZeroException,
} from '@src/domain/exceptions/quantity.exceptions';

export class Quantity {
  private readonly _value: Decimal;
  private readonly _name: string | undefined;

  private constructor(value: Decimal, name?: string) {
    this._value = value;
    this._name = name;
    Object.freeze(this);
  }

  /**
   * 🎯 2. Static Validate (Getter): Sınıf düzeyinde, henüz nesne olmadan ham veriyi doğrular
   * Örn: Quantity.validate.isPositive(dto.amount).orThrow()
   */
  public static get validate() {
    return {
      isPositive: (value: number | string | Decimal) => {
        const decimal = value instanceof Decimal ? value : new Decimal(value);
        const isValid = !decimal.isNegative() && !decimal.isZero();

        return {
          isValid,
          isInvalid: !isValid,
          orThrow: (exception?: Error) => {
            if (!isValid) {
              throw exception ?? new QuantityNotGreaterThanZeroException();
            }
          },
        };
      },
    };
  }

  public get value(): Decimal {
    return this._value;
  }

  public get name(): string | undefined {
    return this._name;
  }

  /**
   * 🎯 1. Public Validate (Getter): Nesne üzerinden iş kurallarını işletir
   * Örn: productQuantity.validate.greaterThanZero.orThrow()
   */
  public get validate() {
    return {
      greaterThanZero: (() => {
        const isGreaterThanZero = !this.value.lessThanOrEqualTo(0);
        return {
          isValid: isGreaterThanZero,
          orThrow: (exception?: Error): Quantity => {
            if (!isGreaterThanZero) {
              throw (
                exception ?? new QuantityNotGreaterThanZeroException(this.name)
              );
            }
            return this;
          },
        };
      })(),
    };
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) miktardan doğrudan VO üretir; doğrulama atlanır.
   * Sadece güvendiğin (persisted) veride kullan.
   */
  public static fromTrusted(
    value: number | string | Decimal,
    context?: string
  ): Quantity {
    return new Quantity(
      value instanceof Decimal ? value : new Decimal(value),
      context
    );
  }

  /**
   * 🎯 Akıllı Factory: Standart ordu nizamımız
   */
  public static create(
    value: number | string | Decimal | null | undefined,
    context?: string
  ) {
    const isBlank = value === null || value === undefined || value === '';

    let instance: Quantity | undefined;
    let error: Error | undefined;

    if (!isBlank) {
      try {
        const decimal = new Decimal(value);
        if (decimal.isNegative()) {
          throw new QuantityNegativeException(context);
        }
        instance = new Quantity(decimal, context);
      } catch (e: any) {
        error = e;
      }
    }

    return {
      instance: error ? undefined : instance,
      orThrow(exception?: Error): Quantity {
        if (error || !instance) {
          throw exception ?? error ?? new QuantityNotGreaterThanZeroException();
        }
        return instance;
      },
    };
  }

  /**
   * 🎯 Pozitif Miktar Fabrikası: Yeni merkezi validate yapısını besler
   */
  public static createPositive(
    value: number | string | Decimal | null | undefined,
    context?: string
  ) {
    const result = Quantity.create(value, context);

    let instance: Quantity | undefined = result.instance;
    let error: Error | undefined;

    if (instance) {
      const validation = instance.validate.greaterThanZero;
      if (!validation.isValid) {
        instance = undefined;
        error = new QuantityNotGreaterThanZeroException(context);
      }
    }

    return {
      instance: error ? undefined : instance,
      orThrow(exception?: Error): Quantity {
        if (error || !instance) {
          throw exception ?? error ?? new QuantityNotGreaterThanZeroException();
        }
        return instance;
      },
    };
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

  public add(other: Quantity): Quantity {
    return new Quantity(this._value.add(other.value), this._name);
  }

  public plus(other: Quantity): Quantity {
    return new Quantity(this._value.plus(other.value), this._name);
  }

  public sub(other: Quantity): Quantity {
    if (this._value.lessThan(other.value)) {
      throw new QuantityInsufficientException(
        this._value.toString(),
        other.value.toString(),
        this._name
      );
    }
    return new Quantity(this._value.sub(other.value), this._name);
  }

  public applyDelta(deltaValue: number | string | Decimal): Quantity {
    const delta =
      deltaValue instanceof Decimal ? deltaValue : new Decimal(deltaValue);
    const newValue = this._value.plus(delta);

    if (newValue.isNegative()) {
      throw new QuantityInsufficientException(
        this._value.toString(),
        delta.abs().toString(),
        this._name
      );
    }

    return new Quantity(newValue, this._name);
  }

  public equals(other: Quantity): boolean {
    return this._value.equals(other.value);
  }

  public toString(): string {
    return this._value.toString();
  }
}
