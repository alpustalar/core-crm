export class FullName {
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

  public static create(value: string) {
    return new FullName(value);
  }

  public static fromTrusted(value: string): FullName {
    return new FullName(value);
  }

  public equals(other: FullName): boolean {
    if (!other) return false;
    return this._value === other.value;
  }
}
