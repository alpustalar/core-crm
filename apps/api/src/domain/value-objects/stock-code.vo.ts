import { z } from 'zod';
import { InvalidStockCodeException } from '@src/domain/exceptions/vo/stock-code.exceptions';

export class StockCode {
  // Şirket standartlarına göre özelleştirilebilir Zod şeması
  // (Örn: Boşluksuz, sadece harf, rakam ve tire içerebilen, büyük harf zorunlu şema)
  private static readonly schema = z
    .string()
    .min(3, 'Stok kodu en az 3 karakter olmalıdır.')
    .max(30, 'Stok kodu en fazla 30 karakter olmalıdır.')
    .regex(
      /^[A-Z0-9-]+$/,
      'Stok kodu sadece büyük harf, rakam ve tire (-) içerebilir.'
    );

  private readonly _value: string;

  private constructor(value: string, trusted = false) {
    // Güvenilir (persisted) veri zaten normalize edilmiştir; tekrar işleme/doğrulama.
    if (trusted) {
      this._value = value;
      return;
    }

    // 🎯 Girişi temizleyip standartlaştırıyoruz (Trim ve Büyük Harf yapma)
    const sanitizedValue = value.trim().toUpperCase();

    if (!StockCode.schema.safeParse(sanitizedValue).success) {
      throw new InvalidStockCodeException();
    }
    this._value = sanitizedValue;
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) veriden doğrudan VO üretir; doğrulama/normalizasyon atlanır.
   */
  public static fromTrusted(value: string): StockCode {
    return new StockCode(value, true);
  }

  get value(): string {
    return this._value;
  }

  /**
   * 🎯 Akıllı Factory: Geriye doğrudan sarmalanmış proxy nesnesi döner.
   */
  public static create(value: string | null | undefined) {
    const isBlank = !value || value.trim().length === 0;

    let instance: StockCode | undefined;
    let error: Error | undefined;

    if (!isBlank) {
      try {
        instance = new StockCode(value);
      } catch {
        error = new InvalidStockCodeException();
      }
    }

    return {
      /**
       * ➔ Opsiyonel Senaryo: Boş veya geçersizse undefined döner (akışı kesmez).
       */
      instance: error ? undefined : instance,

      /**
       * ➔ Zorunlu Senaryo: Boşsa veya geçersizse patlatır, doluysa kesin "StockCode" döner.
       */
      orThrow(exception?: Error): StockCode {
        if (error || !instance) {
          throw exception ?? error ?? new InvalidStockCodeException();
        }
        return instance;
      },
    };
  }

  public equals(other: StockCode): boolean {
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
