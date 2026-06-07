import { ProviderAvailability } from '@shared';
import { OperationMode } from '@prisma/client';

export type ProviderAvailabilityWithCanAcceptExamination =
  ProviderAvailability & {
    provider: {
      canAcceptExamination: boolean;
      operationMode: OperationMode;
    };
  };
