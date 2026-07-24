import { z } from 'zod';
import { InvalidFullNameException } from '@src/domain/exceptions';
import { Name } from './name.vo';
import { LastName } from './last-name.vo';

export class FullName {
  private static readonly schema = z
    .string()
    .trim()
    .min(3, 'Tam isim çok kısa.');
  private readonly _firstName: string;
  private readonly _lastName: string;

  private constructor(firstName: string, lastName: string) {
    this._firstName = firstName;
    this._lastName = lastName;
    Object.freeze(this);
  }

  // Getters
  get value(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  public static create(value: string | null | undefined) {
    const result = this.schema.safeParse(value);

    let instance: FullName | undefined;
    let errorDetail = 'Geçersiz tam isim formatı.';

    if (result.success) {
      // 1. İsimleri parçala (çoklu boşlukları temizle)
      const parts = result.data.split(/\s+/);

      if (parts.length < 2) {
        errorDetail = 'Tam isim en az bir isim ve bir soyadından oluşmalıdır.';
      } else {
        // 2. Sonuncuyu soyadı, kalanları isim olarak ayır
        const lastNameRaw = parts.pop()!;
        const firstNameRaw = parts.join(' ');

        // 3. Mevcut VO'lar ile kuralları uygula
        // Name.create -> Capitalize eder
        // LastName.create -> UpperCase eder
        const fName = Name.create(firstNameRaw).instance;
        const lName = LastName.create(lastNameRaw).instance;

        if (fName && lName) {
          instance = new FullName(fName.value, lName.value);
        } else {
          errorDetail = 'İsim veya soyadı kurallara uygun değil.';
        }
      }
    }

    return {
      instance,
      orThrow(exception?: Error): FullName {
        if (!instance) {
          throw exception ?? new InvalidFullNameException();
        }
        return instance;
      },
    };
  }

  public static fromTrusted(value: string): FullName {
    const parts = value.trim().split(/\s+/);
    const lastNameRaw = parts.pop()!;
    const firstNameRaw = parts.join(' ');

    const fName = Name.fromTrusted(firstNameRaw);
    const lName = LastName.fromTrusted(lastNameRaw);

    return new FullName(fName.value, lName.value);
  }
}
