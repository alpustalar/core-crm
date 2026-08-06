import { Plan } from '@modules/platform/subscription/domain/entities/plan.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';
import { PlanReadModel } from '@modules/platform/subscription/domain/subscription.contracts';

export const PLAN_COMMAND_REPOSITORY = Symbol('IPlanCommandRepository');
export const PLAN_QUERY_REPOSITORY = Symbol('IPlanQueryRepository');

export interface IPlanCommandRepository extends IBaseCommandRepository<Plan> {
  /** planId (sabit enum) unique üzerinden bulun-veya-oluştur (admin plan tanımı). */
  upsertByPlanId(entity: Plan): Promise<Plan>;
  /**
   * planId ile planı yükler (entity). Yazma tarafında: plan fiyatı aboneliğin
   * tutarını, plan satırı da `setModules`'ün hedefini belirliyor.
   */
  findByPlanId(planId: PlanId): Promise<Plan | null>;
  /** Planın modül bundle'ını verilen küme ile değiştirir (PlanModule join replace). */
  setModules(planRowId: string, moduleIds: string[]): Promise<void>;
}

export interface IPlanQueryRepository {
  /** Aktif plan kataloğu + içerdiği modüller (list-plans). */
  findAllActiveWithModules(): Promise<PlanReadModel[]>;
  /** Tek planın bundle modülleri (get-active entitlement). */
  findByPlanIdWithModules(planId: PlanId): Promise<PlanReadModel | null>;
}
