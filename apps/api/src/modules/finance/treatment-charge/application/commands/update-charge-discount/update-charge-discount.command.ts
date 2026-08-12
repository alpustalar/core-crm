import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { UpdateChargeDiscount } from '@shared/modules/treatment-charge/types/commands';

export class UpdateChargeDiscountCommand implements ICommand {
  readonly __responseType!: void;

  constructor(
    public readonly payload: {
      readonly chargeId: string;
      readonly data: UpdateChargeDiscount;
      readonly ctx: IGetContext;
    }
  ) {}
}
