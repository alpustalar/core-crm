import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

/**
 * VKN — Türkiye Vergi Kimlik Numarası (10 hane + doğrulama algoritması).
 * Kurum/şirket vergi kimliği. Şahıs mükellefler TCKN kullanır → [[NationalId]].
 */
export class Vkn {
  private static readonly schema = z
    .string()
    .length(10)
    .regex(/^\d+$/, 'VKN sadece rakamlardan oluşmalıdır.');

  private readonly _value: string;

  constructor(value: string) {
    const result = Vkn.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException('Geçersiz VKN formatı.');
    }
    if (!Vkn.isValidChecksum(value)) {
      throw new BadRequestException('VKN doğrulama algoritmasına uymuyor.');
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: Vkn): boolean {
    if (!other) return false;
    return this._value === other.value;
  }

  /**
   * Resmî VKN algoritması: ilk 9 hane üzerinden 10. (kontrol) hane hesaplanır.
   */
  private static isValidChecksum(vkn: string): boolean {
    const digits = vkn.split('').map(Number);
    const checkDigit = digits[9];

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      const tmp = (digits[i] + (9 - i)) % 10;
      if (tmp !== 0) {
        let p = (tmp * Math.pow(2, 9 - i)) % 9;
        if (p === 0) p = 9;
        sum += p;
      }
    }

    return (10 - (sum % 10)) % 10 === checkDigit;
  }
}
