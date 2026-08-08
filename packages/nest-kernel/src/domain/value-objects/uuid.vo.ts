import { randomUUID } from 'crypto';
import { z } from 'zod';
import { InvalidUuidException } from '@src/domain/exceptions/uuid.exceptions';

export class UUID {
  private static readonly schema = z.uuid('Geçersiz UUID formatı.');
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  public static get validate() {
    return {
      input: (value: string | null | undefined) => {
        const result = UUID.schema.safeParse(value);
        return {
          isValid: result.success,
          error: result.success ? undefined : result.error.issues[0]?.message,
          data: result.success ? result.data : undefined,
        };
      },
    };
  }

  public get value(): string {
    return this._value;
  }

  // 3. Disiplinli Factory
  public static create(value: string | null | undefined) {
    const validation = UUID.validate.input(value);
    const instance = validation.isValid
      ? new UUID(validation.data!)
      : undefined;

    return {
      instance,
      orThrow(exception?: Error): UUID {
        if (!instance) {
          throw exception ?? new InvalidUuidException(validation.error);
        }
        return instance;
      },
    };
  }

  public static fromTrusted(value: string): UUID {
    return new UUID(value);
  }

  public static generate(): UUID {
    return new UUID(randomUUID());
  }

  public static createOrGenerate(value: string | null | undefined): UUID {
    const { instance } = UUID.create(value);
    return instance ?? UUID.generate();
  }

  public isEqualTo(other: string): boolean {
    return this._value === other;
  }

  public isNotEqualTo(other: string): boolean {
    return this._value !== other;
  }

  public toString(): string {
    return this._value;
  }
}
