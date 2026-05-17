import { ProviderAvailability } from '@shared';

export type ProviderAvailabilityWithCanAcceptExamination =
  ProviderAvailability & {
    provider: {
      canAcceptExamination: boolean;
    };
  };
