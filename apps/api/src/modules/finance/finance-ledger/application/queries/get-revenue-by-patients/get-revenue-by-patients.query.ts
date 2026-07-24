import { IQuery } from '@nestjs/cqrs';
import { GetRevenueByPatientsResponse } from './get-revenue-by-patients.response';

/**
 * Verilen hastaların dönem içi INCOME (COMPLETED) gelirini hasta-başı döndürür.
 * Reklam ROI'si (attribution → gelir eşleştirme) için cross-module kullanılır.
 */
export class GetRevenueByPatientsQuery implements IQuery {
  readonly __responseType!: GetRevenueByPatientsResponse;
  constructor(
    public readonly patientIds: string[],
    public readonly from: Date,
    public readonly to: Date
  ) {}
}
