import { AppointmentSlot } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

/**
 * Randevu oluşturma akışından vazgeçildiğinde ("geri"/iptal) slot geçici kilidini
 * serbest bırakır. Yalnız kilidi tutan sahip (holder) serbest bırakabilir; yoksa no-op.
 * holderId personelde aktör userId'sinden türetilir; hasta/AI akışında açıkça geçilir.
 */
export class ReleaseAppointmentSlotCommand {
  readonly __responseType!: void;

  constructor(
    public readonly payload: {
      data: AppointmentSlot;
      ctx: IGetContext;
      holderId?: string;
    }
  ) {}
}
