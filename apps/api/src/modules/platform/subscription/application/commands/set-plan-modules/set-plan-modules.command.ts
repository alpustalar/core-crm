import { ActorContext } from '@common/interfaces';
import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';

export interface SetPlanModulesCommandProps {
  planId: PlanId;
  moduleIds: string[];
  actor: ActorContext;
}

/** Admin: bir planın modül bundle'ını verilen küme ile değiştirir (tam replace). */
export class SetPlanModulesCommand {
  readonly __responseType!: void;
  planId: PlanId;
  moduleIds: string[];
  actor: ActorContext;

  constructor(props: SetPlanModulesCommandProps) {
    Object.assign(this, props);
  }
}
