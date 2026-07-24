import { ActorContext } from '@common/interfaces';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

/** Admin: modül fiyatını/para birimini ve satış durumunu günceller. */
export class UpdateModuleCommand {
  readonly __responseType!: void;

  constructor(
    public readonly payload: {
      moduleId: string;
      monthlyPrice?: number;
      currency?: CurrencyType;
      isActive?: boolean;
      actor: ActorContext;
    }
  ) {}
}
