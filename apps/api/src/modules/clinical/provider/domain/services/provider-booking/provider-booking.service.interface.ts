export const PROVIDER_BOOKING_SERVICE = Symbol('IProviderBookingService');

export interface AssertCanBookParams {
  providerId: string;
  startTime: Date;
  endTime: Date;
  isConsultation?: boolean;
}

export interface IProviderBookingService {
  /**
   * Uzmanın verilen zaman aralığında randevu kabul edip edemeyeceğini doğrular.
   * Herhangi bir kural ihlalinde ilgili Domain Exception fırlatır.
   */
  assertCanBook(params: AssertCanBookParams): Promise<void>;
}
