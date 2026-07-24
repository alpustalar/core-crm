import { InvalidUrlException } from '@src/domain/exceptions';

export class Url {
  private readonly _value: string;
  private readonly _parsed: URL;

  private constructor(value: string) {
    this._value = value;
    this._parsed = new URL(value);
    Object.freeze(this);
  }

  public get value(): string {
    return this._value;
  }
  public get host(): string {
    return this._parsed.host;
  }
  public get pathname(): string {
    return this._parsed.pathname;
  }

  // 2. Akıcı ve Temiz Doğrulama
  public get validate() {
    return {
      isHttps: (): boolean => this._parsed.protocol === 'https:',

      isTrustedCloud: (): boolean =>
        this._parsed.host.endsWith('amazonaws.com') ||
        this._parsed.host.includes('cliniccore'),

      ensureHttps: (msg?: string) => {
        if (this._parsed.protocol !== 'https:') {
          throw new InvalidUrlException(
            msg ?? 'Güvenlik nedeniyle sadece HTTPS protokolü kabul edilir.'
          );
        }
      },
    };
  }

  // 1. Disiplinli Factory: create().orThrow()
  public static create(value: string | null | undefined) {
    const trimmed = value?.trim();
    let instance: Url | undefined;
    let error: Error | undefined;

    if (!trimmed) {
      error = new InvalidUrlException('URL boş olamaz.');
    } else {
      try {
        instance = new Url(trimmed);
      } catch {
        error = new InvalidUrlException('Geçersiz URL formatı.');
      }
    }

    return {
      instance,
      orThrow(exception?: Error): Url {
        if (!instance) throw exception ?? error!;
        return instance;
      },
    };
  }

  public static fromTrusted(value: string): Url {
    return new Url(value);
  }

  public equals(other: Url): boolean {
    return this._value.toLowerCase() === other.value.toLowerCase();
  }
}
