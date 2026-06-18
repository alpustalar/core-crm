import { ProviderAvailability } from '@shared';
import { OperationModeType as OperationMode } from '@input-type-schemas/OperationModeSchema';

export type ProviderAvailabilityWithCanAcceptExamination =
  ProviderAvailability & {
    provider: {
      canAcceptExamination: boolean;
      operationMode: OperationMode;
    };
  };
