import { z } from 'zod';
import { InvalidEmailException } from '@src/domain/exceptions';

export class Email {
  private static readonly schema = z.string().trim().toLowerCase().email();

  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  get value(): string {
    return this._value;
  }

  public static fromTrusted(value: string): Email {
    return new Email(value);
  }

  public static create(value: string | null | undefined) {
    const validation = Email.schema.safeParse(value);

    const instance = validation.success
      ? new Email(validation.data)
      : undefined;

    return {
      instance,

      orThrow(exception?: Error): Email {
        if (!instance) {
          throw exception ?? new InvalidEmailException();
        }
        return instance;
      },
    };
  }

  public equals(other: Email): boolean {
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
