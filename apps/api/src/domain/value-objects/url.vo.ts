import { BadRequestException } from '@nestjs/common';

interface IUrlValidator {
  protocol: {
    isHttps: boolean;
    orThrow: (msg?: string) => void;
  };
  domain: {
    isTrustedCloud: boolean;
  };
}

export class Url {
  private readonly _value: string;
  private readonly _parsed: URL; // Node.js built-in URL nesnesi

  private constructor(value: string) {
    this._value = value;
    this._parsed = new URL(value);
    Object.freeze(this);
  }

  get value(): string {
    return this._value;
  }
  get host(): string {
    return this._parsed.host;
  }
  get pathname(): string {
    return this._parsed.pathname;
  }

  /**
   * 🎯 2026 Standart Zırhlı Validate Katmanı
   */
  public get validate(): IUrlValidator {
    const self = this;
    const isHttps = self._parsed.protocol === 'https:';
    // Örn: Sadece bizim AWS S3 veya MinIO domainimize mi ait kontrolü
    const isTrustedCloud =
      self._parsed.host.endsWith('amazonaws.com') ||
      self._parsed.host.includes('cliniccore');

    return {
      protocol: {
        get isHttps() {
          return isHttps;
        },
        orThrow: (msg?: string) => {
          if (!isHttps)
            throw new BadRequestException(
              msg ?? 'Güvenlik nedeniyle sadece HTTPS protokolü kabul edilir.'
            );
        },
      },
      domain: {
        get isTrustedCloud() {
          return isTrustedCloud;
        },
      },
    };
  }

  public static fromTrusted(value: string): Url {
    return new Url(value);
  }

  public static create(value: string | null | undefined) {
    if (!value) {
      return {
        instance: undefined,
        orThrow: () => {
          throw new BadRequestException('URL boş olamaz.');
        },
      };
    }

    let instance: Url | undefined;
    let error: Error | undefined;

    try {
      // Geçersiz bir URL yapısındaysa Node.js new URL() otomatik fırlatır
      instance = new Url(value);
    } catch (e) {
      error = new BadRequestException('Geçersiz URL formatı.');
    }

    return {
      instance: error ? undefined : instance,
      orThrow: (): Url => {
        if (error || !instance) throw error!;
        return instance;
      },
    };
  }

  public equals(other: Url): boolean {
    return this._value.toLowerCase() === other.value.toLowerCase();
  }
}
