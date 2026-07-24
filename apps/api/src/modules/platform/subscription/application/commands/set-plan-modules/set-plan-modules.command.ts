import { ActorContext } from '@common/interfaces';
import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';

/** Admin: bir planın modül bundle'ını verilen küme ile değiştirir (tam replace). */
export class SetPlanModulesCommand {
  readonly __responseType!: void;

  constructor(
    readonly payload: {
      planId: PlanId;
      moduleIds: string[];
      actor: ActorContext;
    }
  ) {}
}
