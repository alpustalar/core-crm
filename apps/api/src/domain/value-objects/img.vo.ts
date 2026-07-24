import { z } from 'zod';
import {
  InsecureImageProtocolException,
  InvalidImageException,
} from '@src/domain/exceptions/img.exceptions';

export class Img {
  // XSS ve sinsi script enjeksiyonlarını engellemek için url() barikatı hala devrede.
  private static readonly SCHEMA = z.url("Geçerli bir görsel URL'i olmalıdır.");

  // 🎯 Uzantı zorunluluğunu kaldırdık, sadece geçerli bir URL olmasını garanti ediyoruz.
  private readonly _value: string | null;

  private constructor(value: string | null) {
    this._value = value;
    Object.freeze(this);
  }

  /**
   * 🎯 2. Public Validate (Getter): Görsel üzerindeki ek güvenlik ve iş kuralları
   * Örn: logo.validate.secureProtocol.orThrow()
   */
  public get validate() {
    return {
      secureProtocol: {
        isValid: (() => {
          return this._value ? this._value.startsWith('https://') : true;
        })(),
        orThrow: (msg?: string) => {
          if (this._value && !this._value.startsWith('https://')) {
            throw new InsecureImageProtocolException(msg);
          }
        },
      },
    };
  }

  /**
   * 🎯 3. Değişik Formatlarda Dönme Metotları (Output Formatters)
   */

  // Ham string veya null değeri döner (Prisma/DB için)
  public get value(): string | null {
    return this._value;
  }

  public get hasValue(): boolean {
    return this._value !== null;
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) görsel URL'inden (veya null) doğrudan VO üretir; doğrulama atlanır.
   */
  public static fromTrusted(value: string | null): Img {
    return new Img(value);
  }

  /**
   * 🎯 1. Akıllı Factory: Nullable ve esnek URL'leri yöneten giriş kapısı
   */
  public static create(value: string | null | undefined) {
    const result = this.SCHEMA.safeParse(value?.trim());
    const instance = result.success ? new Img(result.data) : undefined;

    return {
      instance,
      orThrow(exception?: Error): Img {
        if (!instance) {
          throw exception ?? new InvalidImageException();
        }
        return instance;
      },
    };
  }

  // Frontend formatı: Doğrudan JSON.stringify içine girdiğinde ne basılacağını belirler
  public toJSON(): string | null {
    return this._value;
  }

  // String formatı: `String(img)` veya template literal içinde çağrıldığında
  public toString(): string {
    return this._value ?? '';
  }

  // HTML/Önyüz Formatı: Resim etiketlerinde doğrudan "src" attribute'una basılacak güvenli obje
  public toHtmlAttribute(): { src: string } {
    return {
      src: this.getUrlWithFallback(),
    };
  }

  // API Response Formatı: DTO'lardan dışarıya nesne fırlatırken standartlaştırılmış nesne yapısı
  public toResponse(fallbackText?: string) {
    return {
      url: this._value,
      fallbackUrl: this.getUrlWithFallback(fallbackText),
      hasImage: this.hasValue,
    };
  }

  /**
   * Fallback Mekanizması
   */
  public getUrlWithFallback(fallbackText?: string): string {
    if (this._value) return this._value;

    const formattedText = fallbackText
      ? encodeURIComponent(fallbackText)
      : 'App';
    return `https://ui-avatars.com/api/?name=${formattedText}&background=random&size=128`;
  }
}
