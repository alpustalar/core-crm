import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import { InvalidPhoneException } from '@src/domain/exceptions/vo/phone.exceptions';

export class Phone {
  private static readonly phoneUtil = PhoneNumberUtil.getInstance();
  private readonly _value: string; // E.164 formatında saklanır (+905321234567)

  private constructor(rawValue: string, defaultRegion?: string, trusted = false) {
    // Güvenilir (persisted) veri zaten E.164 formatındadır; yeniden parse/format etme.
    this._value = trusted
      ? rawValue
      : this.validateAndFormat(rawValue, defaultRegion);
  }

  get value(): string {
    return this._value;
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (E.164) veriden doğrudan VO üretir; libphonenumber
   * doğrulama/formatlama maliyetini atlar. Sadece güvendiğin (DB) veride kullan.
   */
  public static fromTrusted(value: string): Phone {
    return new Phone(value, undefined, true);
  }

  /**
   * 🎯 Akıllı Factory: Geriye doğrudan sarmalanmış proxy nesnesi döner.
   * defaultRegion: Eğer numaranın başında +90 gibi bir kod yoksa varsayılan olarak hangi ülke sayılsın (Örn: 'TR', 'US')
   */
  public static create(value: string | null | undefined, defaultRegion = 'TR') {
    const isBlank = !value || value.trim().length === 0;

    let instance: Phone | undefined;
    let error: Error | undefined;

    if (!isBlank) {
      try {
        instance = new Phone(value, defaultRegion);
      } catch (e) {
        error = e instanceof Error ? e : new InvalidPhoneException();
      }
    }

    return {
      /**
       * ➔ Opsiyonel Senaryo: Geçersizse veya boşsa undefined döner (Validasyon hatası fırlatmaz)
       */
      instance: error ? undefined : instance,

      /**
       * ➔ Zorunlu Senaryo: Boşsa veya validasyondan geçemediyse küt diye fırlatır.
       * Başarılıysa kesin olarak temizlenmiş "Phone" nesnesini teslim eder.
       */
      orThrow(exception?: Error): Phone {
        if (error || !instance) {
          throw exception ?? error ?? new InvalidPhoneException();
        }
        return instance;
      },
    };
  }

  public equals(other: Phone): boolean {
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }

  /**
   * 🛠️ Libphonenumber motoru ile doğrulama ve formatlama
   */
  private validateAndFormat(rawValue: string, defaultRegion?: string): string {
    try {
      // Numarayı parse et (Başında + yoksa defaultRegion'a göre yorumlar)
      const parsedNumber = Phone.phoneUtil.parseAndKeepRawInput(
        rawValue,
        defaultRegion?.toUpperCase()
      );

      // 🌍 Dünyanın neresinden gelirse gelsin numara o ülke kurallarına göre GERÇEKTEN VALİD Mİ?
      const isValid = Phone.phoneUtil.isValidNumber(parsedNumber);

      if (!isValid) {
        throw new InvalidPhoneException(
          `Telefon numarası formatı ilgili ülke (${defaultRegion}) için geçersiz.`
        );
      }

      // Veri tabanında standart saklamak için E.164 formatına çeviriyoruz (+905321234567)
      return Phone.phoneUtil.format(parsedNumber, PhoneNumberFormat.E164);
    } catch (error) {
      // Zaten domain hatasıysa olduğu gibi yükselt; değilse parse hatası olarak sarmala.
      if (error instanceof InvalidPhoneException) throw error;
      throw new InvalidPhoneException('Telefon numarası ayrıştırılamadı.');
    }
  }
}
