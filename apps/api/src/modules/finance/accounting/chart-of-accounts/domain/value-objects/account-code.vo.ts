import { BadRequestException } from '@nestjs/common';

export class AccountCode {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public get level(): number {
    return this._value.split('.').length;
  }

  public get parentCode(): string | null {
    if (this.isMainAccount()) {
      return null;
    }
    const segments = this.value.split('.');
    segments.pop();
    return segments.join('.');
  }

  public static create(codeStr: string): AccountCode {
    if (!codeStr) {
      throw new BadRequestException('Hesap kodu boş olamaz.');
    }

    const cleanedCode = codeStr.trim().replace(/\s+/g, '');

    const accountCodeRegex = /^\d+(?:\.\d+)*$/;
    if (!accountCodeRegex.test(cleanedCode)) {
      throw new BadRequestException(
        `Geçersiz hesap kodu formatı: "${codeStr}". Sadece rakam ve '.' içerebilir.`
      );
    }

    return new AccountCode(cleanedCode);
  }

  public isMainAccount(): boolean {
    return !this._value.includes('.');
  }

  public equals(other: AccountCode): boolean {
    if (!other) return false;
    return this.value === other.value;
  }
}
