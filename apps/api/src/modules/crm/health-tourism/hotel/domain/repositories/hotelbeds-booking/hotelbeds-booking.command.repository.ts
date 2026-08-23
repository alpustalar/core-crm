import { HotelbedsBooking } from '../../entities/hotelbeds-booking.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const HOTELBEDS_BOOKING_COMMAND_REPOSITORY = Symbol(
  'IHotelbedsBookingCommandRepository'
);
export interface IHotelbedsBookingCommandRepository extends IBaseCommandRepository<HotelbedsBooking> {
  /**
   * Rezervasyonu `FOR UPDATE` kilitleyerek yükler — yalnız aktif transaction
   * içinde. İptal kararını besleyen okuma kilitsiz yapılırsa iki eşzamanlı iptal
   * isteği de "aktif" görüp HotelBeds'e iki kez iptal + iki kez iade tetikler.
   */
  findByIdForUpdate(id: string): Promise<HotelbedsBooking | null>;
}
