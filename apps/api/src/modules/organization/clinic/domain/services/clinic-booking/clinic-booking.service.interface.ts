export const CLINIC_BOOKING_SERVICE = Symbol('IClinicBookingService');

export interface AssertClinicCanBookParams {
  clinicId: string;
  startTime: Date;
  endTime: Date;
}

export interface BookingSlotItem {
  date: Date;
  startMinute: number;
  endMinute: number;
}

export interface AssertClinicSlotsWithinHoursParams {
  clinicId: string;
  items: BookingSlotItem[];
}

export interface IClinicBookingService {
  /**
   * Kliniğin belirtilen tarih ve saat aralığında randevu kabul edip edemeyeceğini doğrular.
   * Kural ihlali durumunda ilgili Domain Exception fırlatır.
   */
  assertCanBook(params: AssertClinicCanBookParams): Promise<void>;

  /**
   * İstenen zaman dilimlerinin klinik çalışma saatleri ve istisnaları
   * dahilinde olup olmadığını doğrular, uygun değilse exception fırlatır.
   */
  assertTimeWithinClinicHours(
    params: AssertClinicSlotsWithinHoursParams
  ): Promise<void>;
}
