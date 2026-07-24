import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpdateTreatmentPackage } from '@shared';

export interface UpdateTreatmentPackageCommandPayload {
  packageId: string;
  data: UpdateTreatmentPackage;
  ctx: IGetContext;
}

export class UpdateTreatmentPackageCommand {
  constructor(public readonly payload: UpdateTreatmentPackageCommandPayload) {}
}
