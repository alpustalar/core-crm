import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

export class TckNo {
  private static readonly schema = z
    .string()
    .length(11)
    .regex(/^\d+$/, 'TCKN sadece rakamlardan oluşmalıdır.')
    .refine((val) => val[0] !== '0', 'TCKN ilk hanesi 0 olamaz.');
  private readonly _value: string;

  constructor(value: string) {
    const result = TckNo.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException('Geçersiz TCKN formatı.');
    }

    if (!this.isValidChecksum(value)) {
      throw new BadRequestException('TCKN doğrulama algoritmasına uymuyor.');
    }

    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  static tryParse(tcNo: string | null | undefined): string | null {
    if (!tcNo) return null;
    try {
      return new TckNo(tcNo).value;
    } catch {
      return null;
    }
  }

  private isValidChecksum(id: string): boolean {
    const digits = id.split('').map(Number);

    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    const tenthDigit = (oddSum * 7 - evenSum) % 10;

    if (tenthDigit !== digits[9]) return false;

    const totalSum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
    return totalSum % 10 === digits[10];
  }
}
