import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import { InvalidPhoneException } from '@src/domain/exceptions/phone.exceptions';
import { isEmpty } from '@common/utils';

export class Phone {
  private static readonly phoneUtil = PhoneNumberUtil.getInstance();
  private readonly _value: string; // E.164 formatında saklanır (+905321234567)

  private constructor(value: string) {
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (E.164) veriden doğrudan VO üretir; libphonenumber
   * doğrulama/formatlama maliyetini atlar. Sadece güvendiğin (DB) veride kullan.
   */
  public static fromTrusted(value: string): Phone {
    return new Phone(value);
  }

  /**
   * 🎯 Akıllı Factory: Geriye doğrudan sarmalanmış proxy nesnesi döner.
   * defaultRegion: Eğer numaranın başında +90 gibi bir kod yoksa varsayılan olarak hangi ülke sayılsın (Örn: 'TR', 'US')
   */
  public static create(value: string | null | undefined, defaultRegion = 'TR') {
    const isBlank = isEmpty(value);

    const instance = !isBlank
      ? new Phone(this.validateAndFormat(value, defaultRegion))
      : undefined;

    return {
      instance,
      orThrow(exception?: Error): Phone {
        if (!instance) {
          throw exception ?? new InvalidPhoneException();
        }
        return instance;
      },
    };
  }

  /**
   * 🛠️ Libphonenumber motoru ile doğrulama ve formatlama
   */
  static validateAndFormat(rawValue: string, defaultRegion?: string): string {
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

  public equals(other: Phone): boolean {
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
