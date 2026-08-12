import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { VoidTreatmentCharge } from '@shared/modules/treatment-charge/types/commands';

export class VoidTreatmentChargeCommand implements ICommand {
  readonly __responseType!: void;

  constructor(
    public readonly payload: {
      readonly chargeId: string;
      readonly data: VoidTreatmentCharge;
      readonly ctx: IGetContext;
    }
  ) {}
}
