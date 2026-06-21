/**
 * Tüm domain/application iş-mantığı hatalarının taban sınıfı. Bu katmanlar (handler,
 * service, use-case, entity) HTTP protokolünden izoledir; NestJS HTTP exception'ları
 * (`BadRequestException` vb.) kullanılmaz — bunun yerine `DomainException`'dan türetilmiş,
 * `errorCode` barındıran özel hatalar fırlatılır. HTTP status eşlemesi tek bir yerde
 * (all-exceptions-filter) yapılır.
 */
export abstract class DomainException extends Error {
  /** Makine-okunur, string tabanlı hata kodu (ör. 'PAYMENT.INSTALLMENT_NOT_FOUND'). */
  public abstract readonly errorCode: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
    // TS down-level (extends Error) prototip zinciri düzeltmesi — instanceof güvenliği.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
