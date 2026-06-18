import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';

export class EmailAddress {
  private static readonly schema = z.email();
  private readonly _value: string;

  constructor(value: string) {
    const result = EmailAddress.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException(`Geçersiz e-posta adresi: ${value}`);
    }

    this._value = result.data;
  }

  get value(): string {
    return this._value;
  }
}
