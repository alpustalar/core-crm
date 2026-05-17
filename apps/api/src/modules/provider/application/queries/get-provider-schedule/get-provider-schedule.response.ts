import { ProviderException } from '@shared';
import { ProviderAvailabilityWithCanAcceptExamination } from '@modules/provider/domain/types/provider-availability-with-can-accept-examination';

export interface ProviderScheduleResponse {
  availabilities: ProviderAvailabilityWithCanAcceptExamination[];
  exceptions: ProviderException[];
}
