import { ActorContext } from '@common/interfaces';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export interface UpdateModuleCommandProps {
  moduleId: string;
  monthlyPrice?: number;
  currency?: CurrencyType;
  isActive?: boolean;
  actor: ActorContext;
}

/** Admin: modül fiyatını/para birimini ve satış durumunu günceller. */
export class UpdateModuleCommand {
  readonly __responseType!: void;
  moduleId: string;
  monthlyPrice?: number;
  currency?: CurrencyType;
  isActive?: boolean;
  actor: ActorContext;

  constructor(props: UpdateModuleCommandProps) {
    Object.assign(this, props);
  }
}
