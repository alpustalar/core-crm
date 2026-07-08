import { QueryResponse } from '@shared/common/response/response.interface';
import { BillingTargetType } from '@input-type-schemas/BillingTargetSchema';

/** Org'un platform aboneliği faturalandırma hedefi (ORGANIZATION | CLINIC). */
export type GetOrganizationBillingTargetResponse =
  QueryResponse<BillingTargetType>;
