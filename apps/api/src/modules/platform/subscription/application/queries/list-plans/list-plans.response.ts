import { QueryResponse } from '@shared/common/response/response.interface';
import { PlanReadModel } from '@modules/platform/subscription/domain/subscription.contracts';

/** Aktif plan kataloğu (plan + içerdiği modüller). */
export type ListPlansResponse = QueryResponse<PlanReadModel[]>;
