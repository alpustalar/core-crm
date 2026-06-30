import { z } from 'zod';

export const PatientNameSchema = z
  .string()
  .min(2, 'Hasta adı ve soyadı en az 2 karakterden oluşmalıdır.');

export class PatientName {
  private readonly _value: string;
  private readonly _firstName: string;
  private readonly _lastName: string;

  private constructor(value: string) {
    const cleaned = value.replace(/\s+/g, ' ').trim();
    const parts = cleaned.split(' ');

    this._lastName = parts.pop()?.toUpperCase() || '';
    this._firstName = parts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');

    this._value = `${this._firstName} ${this._lastName}`.trim();
  }

  // Getters
  get value(): string {
    return this._value;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  public static create(value: string | null | undefined) {
    const result = PatientNameSchema.safeParse(value);

    return {
      instance: result.success ? new PatientName(result.data) : null,
      orThrow: (): PatientName => {
        if (!result.success) {
          throw new Error(result.error.message);
        }
        return new PatientName(result.data);
      },
    };
  }

  public static fromTrusted(value: string): PatientName {
    return new PatientName(value);
  }

  public equals(other: PatientName): boolean {
    if (!other) return false;
    return this._value === other.value;
  }
}
