import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { IGetContext } from '@common/decorators';

/** Admin: yeni eklenti modülü tanımlar. Dönüş: oluşturulan modül id'si. */
export class CreateModuleCommand {
  readonly __responseType!: string;
  constructor(
    public readonly payload: {
      key: string;
      name: string;
      monthlyPrice: number;
      currency: CurrencyType;
      description?: string | null;
      ctx: IGetContext;
    }
  ) {}
}
