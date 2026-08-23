import { Validate } from '@common/interfaces';
import { CreateAppointmentProps } from '@modules/clinical/appointment/domain/contracts/appointment';

export interface IAppointmentRules {
  /** Randevu oluşturma kurallarını doğrular*/
  schedule(props: Pick<CreateAppointmentProps, 'startTime'>): Validate;
  /** Randevuyu "Gelmedi" (No-Show) olarak işaretleme kurallarını doğrular */
  get markAsNoShow(): Validate;

  /** Randevu giriş (Check-In) kurallarını doğrular */
  get checkIn(): Validate;

  /** Randevuyu tamamlama (Complete) kurallarını doğrular */
  get complete(): Validate;

  /** Randevuyu onaylama (Confirm) kurallarını doğrular */
  get confirm(): Validate;

  /** Randevunun yeniden planlanma (Reschedule) zaman kurallarını doğrular */
  reschedule(startTime: Date, endTime: Date): Validate;

  /** Randevunun iptal edilip edilemeyeceğini (Statü kontrolü) doğrular */
  get canBeCancelled(): Validate;

  /** Randevunun takvime eklenip eklenemeyeceğini (Statü kontrolü) doğrular */
  get canBeScheduled(): Validate;
}
