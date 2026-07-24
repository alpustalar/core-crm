import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetClinicOpenSlotsDto } from '@shared/modules/appointment/dto/queries/get-clinic-open-slots.dto';
import { GetClinicOpenSlotsResponse } from './get-clinic-open-slots.response';

/**
 * Bir kliniğin verilen tarih aralığındaki tüm açık (boş) randevu slotlarını sorgular.
 * Klinik programı/istisnaları + doktor programı/istisnaları + dolu randevular + molalar
 * hesaba katılarak klinik-yereli slotlar üretilir. providerId verilirse tek doktora daralır.
 */
export class GetClinicOpenSlotsQuery implements IQuery {
  readonly __responseType!: GetClinicOpenSlotsResponse;

  constructor(
    public readonly dto: GetClinicOpenSlotsDto,
    public readonly ctx: IGetContext
  ) {}
}
