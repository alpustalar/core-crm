import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

export class InvoiceNumber {
  private readonly _value: string;

  // GİB standardı: 3 harf/rakam seri + 4 yıl + 9 sıra numarası = 16 karakter
  private static readonly SCHEMA = z
    .string()
    .length(16, 'Fatura numarası tam 16 karakter olmalıdır (AAA2026000000001).')
    .regex(
      /^[A-Z0-9]{3}\d{4}\d{9}$/,
      'Geçersiz fatura numarası formatı. Örnek: ABC2026000000001'
    );

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): InvoiceNumber {
    const result = this.SCHEMA.safeParse(value.trim().toUpperCase());

    if (!result.success) {
      throw new BadRequestException(result.error.issues[0].message);
    }

    return new InvoiceNumber(result.data);
  }

  public get value(): string {
    return this._value;
  }

  public toString(): string {
    return this._value;
  }
}
