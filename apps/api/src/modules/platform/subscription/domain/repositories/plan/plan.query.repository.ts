import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';
import { PlanReadModel } from '@modules/platform/subscription/domain/contracts/subscription.contracts';

export const PLAN_QUERY_REPOSITORY = Symbol('IPlanQueryRepository');

export interface IPlanQueryRepository {
  /** Aktif plan kataloğu + içerdiği modüller (list-plans). */
  findAllActiveWithModules(): Promise<PlanReadModel[]>;
  /** Tek planın bundle modülleri (get-active entitlement). */
  findByPlanIdWithModules(planId: PlanId): Promise<PlanReadModel | null>;
}
