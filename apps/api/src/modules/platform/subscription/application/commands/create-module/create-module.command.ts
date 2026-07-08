import { ActorContext } from '@common/interfaces';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export interface CreateModuleCommandProps {
  key: string;
  name: string;
  monthlyPrice: number;
  currency: CurrencyType;
  description?: string | null;
  actor: ActorContext;
}

/** Admin: yeni eklenti modülü tanımlar. Dönüş: oluşturulan modül id'si. */
export class CreateModuleCommand {
  readonly __responseType!: string;
  key: string;
  name: string;
  monthlyPrice: number;
  currency: CurrencyType;
  description?: string | null;
  actor: ActorContext;

  constructor(props: CreateModuleCommandProps) {
    Object.assign(this, props);
  }
}
