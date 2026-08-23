import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { HotelbedsTransferBooking } from '@modules/crm/health-tourism/transfer/domain/entities/hotelbeds-transfer-booking.entity';

export const HOTELBEDS_TRANSFER_BOOKING_COMMAND_REPOSITORY = Symbol(
  'IHotelbedsTransferBookingCommandRepository'
);
export interface IHotelbedsTransferBookingCommandRepository
  extends IBaseCommandRepository<HotelbedsTransferBooking> {
  findByReference(reference: string): Promise<HotelbedsTransferBooking | null>;
  /**
   * Rezervasyonu `FOR UPDATE` kilitleyerek yükler — yalnız aktif transaction
   * içinde. İptal kararını besleyen okuma kilitsiz yapılırsa iki eşzamanlı iptal
   * isteği de "aktif" görüp HotelBeds'e iki kez iptal + iki kez iade tetikler.
   */
  findByIdForUpdate(id: string): Promise<HotelbedsTransferBooking | null>;
  /** Sağlayıcı referansıyla kilitleyerek yükler — yalnız transaction içinde. */
  findByReferenceForUpdate(
    reference: string
  ): Promise<HotelbedsTransferBooking | null>;
}
