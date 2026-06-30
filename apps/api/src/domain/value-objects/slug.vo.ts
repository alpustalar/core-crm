import { slugIt } from '@common/utils';
import { EmptySlugSourceException } from '@src/domain/exceptions/vo/slug.exceptions';

export class Slug {
  private constructor(rawString: string) {
    this._value = rawString;
  }

  private _value: string;
  get value(): string {
    return this._value;
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) slug'dan doğrudan VO üretir; yeniden slugify atlanır.
   */
  public static fromTrusted(value: string): Slug {
    return new Slug(value);
  }

  /**
   * 🎯 Factory Method: Ham string unvan veya isimden güvenli slug üretir
   */
  public static create(rawString: string): Slug {
    if (!rawString || rawString.trim().length === 0) {
      throw new EmptySlugSourceException();
    }

    const cleanedSlug = this.slugify(rawString);
    return new Slug(cleanedSlug);
  }

  private static slugify(text: string): string {
    return slugIt(text);
  }
}
