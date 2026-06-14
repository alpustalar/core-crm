import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetArAgingResponse } from './get-ar-aging.response';

/**
 * AR aging — bir şubenin açık taksitlerinin vade yaşlandırması + tahsilat
 * performansı. asOf verilmezse bugün esas alınır. Hasta adları çağırana ait
 * (rapor yalnız patientId döner — bounded context).
 */
export class GetArAgingQuery implements IQuery {
  readonly __responseType!: GetArAgingResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext,
    public readonly asOf?: Date
  ) {}
}
