import { ActorContext } from '@common/interfaces';
import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export interface UpsertPlanCommandProps {
  planId: PlanId;
  name: string;
  monthlyPrice: number;
  currency: CurrencyType;
  actor: ActorContext;
}

/** Admin: sabit planId için plan tanımını (fiyat/isim) oluşturur veya günceller. */
export class UpsertPlanCommand {
  readonly __responseType!: string;
  planId: PlanId;
  name: string;
  monthlyPrice: number;
  currency: CurrencyType;
  actor: ActorContext;

  constructor(props: UpsertPlanCommandProps) {
    Object.assign(this, props);
  }
}
