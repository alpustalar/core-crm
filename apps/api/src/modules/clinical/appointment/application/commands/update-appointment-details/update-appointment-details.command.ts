import { UpdateAppointmentDetails } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

/**
 * Personel (resepsiyon) randevu detay düzenleme. appointmentId path'ten, düzenlenecek
 * alanlar gövdeden gelir. Zaman/doktor/durum bu command'e dahil değildir.
 */
export class UpdateAppointmentDetailsCommand {
  readonly __responseType!: void;

  constructor(
    public readonly payload: {
      appointmentId: string;
      data: UpdateAppointmentDetails;
      ctx: IGetContext;
    }
  ) {}
}
