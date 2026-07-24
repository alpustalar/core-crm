import { UpdateClinicAppointmentSettings } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

/**
 * Kliniğin randevu davranış ayarlarını (overbooking, hasta booking/iptal sınırları,
 * onay zorunluluğu, slot süresi vb.) günceller. clinicId path'ten, alanlar gövdeden.
 * Satır yoksa default'tan üretilip upsert edilir; Redis cache güncelleme sonrası bust.
 */

export class UpdateClinicAppointmentSettingsCommand {
  readonly __responseType!: void;

  constructor(
    public readonly payload: {
      clinicId: string;
      data: UpdateClinicAppointmentSettings;
      ctx: IGetContext;
    }
  ) {}
}
