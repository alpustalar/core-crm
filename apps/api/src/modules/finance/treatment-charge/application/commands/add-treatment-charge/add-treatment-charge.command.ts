import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { AddTreatmentCharge } from '@shared/modules/treatment-charge/types/commands';

/**
 * Randevuya fiyatlı işlem satırı ekler. Oluşturulan satırın id'si döner.
 */
export class AddTreatmentChargeCommand implements ICommand {
  readonly __responseType!: string;

  constructor(
    public readonly payload: {
      readonly appointmentId: string;
      readonly data: AddTreatmentCharge;
      readonly ctx: IGetContext;
    }
  ) {}
}
