import { ProviderAvailabilityWithAcceptsConsultation } from '@modules/clinical/provider/domain/contracts/provider.contracts';
import { QueryResponse } from '@shared/common/response/response.interface';
import { OperationModeSchema } from '@input-type-schemas/OperationModeSchema';
import { ProviderException, ProviderShift } from '@shared';

export type ProviderStaticScheduleData = {
  operationMode: typeof OperationModeSchema.enum.STATIC;
  availabilities: ProviderAvailabilityWithAcceptsConsultation[];
  exceptions: ProviderException[];
};

export type ProviderShiftScheduleData = {
  operationMode: typeof OperationModeSchema.enum.SHIFT;
  shifts: ProviderShift[];
  exceptions: ProviderException[];
};

export type GetProviderScheduleQueryResponse = QueryResponse<
  ProviderStaticScheduleData | ProviderShiftScheduleData
>;
