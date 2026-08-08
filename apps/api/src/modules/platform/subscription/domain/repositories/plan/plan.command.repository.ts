import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';
import { Plan } from '@modules/platform/subscription/domain/entities/plan.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const PLAN_COMMAND_REPOSITORY = Symbol('IPlanCommandRepository');

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
