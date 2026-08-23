import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetPatientByIdResponse } from './get-patient-by-id.response';

/**
 * Hasta detayı — **HTTP yüzeyi** için. `FindPatientByIdQuery`'den ayrı durur:
 * o, modüller arası (lead dönüşümü, randevu) çağrılan yetki kontrolsüz iç
 * sorgudur ve çağıranın kendi yetkisi zaten kapıda doğrulanmıştır. Dışarıya
 * açılan uç ayrıca policy'den geçmek zorundadır, yoksa `patient:read` yetkisi
 * olan herkes başka bir organizasyonun hastasını id ile okuyabilirdi.
 */
export class GetPatientByIdQuery implements IQuery {
  readonly __responseType!: GetPatientByIdResponse;

  constructor(
    public readonly patientId: string,
    public readonly ctx: IGetContext
  ) {}
}
