import { GetClinicDailySummary } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { GetClinicDailySummaryQueryResponse } from './get-clinic-daily-summary.response';

/**
 * Resepsiyon günlük özeti: aktörün kliniğinde verilen gün için status bazlı randevu
 * sayımları. Gün, klinik yerelinde yorumlanır; providerId verilirse tek doktora
 * daralır. clinicId aktör bağlamından alınır.
 */
export class GetClinicDailySummaryQuery implements IQuery {
  readonly __responseType!: GetClinicDailySummaryQueryResponse;

  constructor(
    public readonly filter: GetClinicDailySummary,
    public readonly ctx: IGetContext
  ) {}
}
