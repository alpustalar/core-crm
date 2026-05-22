import { ProviderException, ProviderShift } from '@shared';
import { ProviderAvailabilityWithCanAcceptExamination } from '@modules/provider/domain/types/provider-availability-with-can-accept-examination';
import { QueryResponse } from '@shared/common/response/response.interface';
import { OperationMode } from '@prisma/client';

export type ProviderStaticScheduleData = {
  operationMode: typeof OperationMode.STATIC;
  availabilities: ProviderAvailabilityWithCanAcceptExamination[];
  exceptions: ProviderException[];
};

export type ProviderShiftScheduleData = {
  operationMode: typeof OperationMode.SHIFT;
  shifts: ProviderShift[];
  exceptions: ProviderException[];
};

export type GetProviderScheduleQueryResponse = QueryResponse<
  ProviderStaticScheduleData | ProviderShiftScheduleData
>;
