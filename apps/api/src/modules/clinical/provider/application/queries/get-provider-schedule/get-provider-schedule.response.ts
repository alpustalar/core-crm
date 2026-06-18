import { ProviderException, ProviderShift } from '@shared';
import { ProviderAvailabilityWithCanAcceptExamination } from '@modules/clinical/provider/domain/types/provider-availability-with-can-accept-examination';
import { QueryResponse } from '@shared/common/response/response.interface';
import { OperationModeSchema } from '@input-type-schemas/OperationModeSchema';

export type ProviderStaticScheduleData = {
  operationMode: typeof OperationModeSchema.enum.STATIC;
  availabilities: ProviderAvailabilityWithCanAcceptExamination[];
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
