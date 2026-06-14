import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetProviderRevenueResponse } from './get-provider-revenue.response';

/**
 * Hekim bazında ciro — bir şubede tahsil edilmiş (COMPLETED) taksitlerin
 * hekim boyutunda toplamı. Opsiyonel tahsilat (paidAt) tarih aralığı. Hekim
 * adları çağırana ait (rapor yalnız providerId döner — bounded context).
 */
export class GetProviderRevenueQuery implements IQuery {
  readonly __responseType!: GetProviderRevenueResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext,
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date
  ) {}
}
