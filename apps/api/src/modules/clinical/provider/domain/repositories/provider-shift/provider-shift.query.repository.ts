import { ProviderShift } from '@shared';
import { IBaseQueryRepository } from '@common/domain/repositories/base-query-repository.interface';

export const PROVIDER_SHIFT_QUERY_REPOSITORY = Symbol(
  'IProviderShiftQueryRepository'
);

export interface IProviderShiftQueryRepository
  extends IBaseQueryRepository<ProviderShift> {
  findShiftsByDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProviderShift[]>;
}
