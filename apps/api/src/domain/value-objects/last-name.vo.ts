export class LastName {
  private readonly _value: string;

  private constructor(value: string) {
    // Soyadı tamamen büyük harfe çevir (Türkçe destekli: ı->I, i->İ)
    this._value = value.replace(/\s+/g, '').trim().toLocaleUpperCase('tr-TR');
  }

  get value(): string {
    return this._value;
  }

  public static create(value: string) {
    return new LastName(value);
  }

  public static fromTrusted(value: string): LastName {
    return new LastName(value);
  }

  public equals(other: LastName): boolean {
    return other && this._value === other.value;
  }
}
