import { QueryResponse } from '@shared/common/response/response.interface';
import { ClinicFinanceSettings } from '@shared';

export type GetClinicFinanceSettingsResponse =
  QueryResponse<ClinicFinanceSettings | null>;
