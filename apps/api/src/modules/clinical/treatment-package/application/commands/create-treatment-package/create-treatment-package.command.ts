import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateTreatmentPackage } from '@shared';

export class CreateTreatmentPackageCommand {
  constructor(
    public readonly data: CreateTreatmentPackage,
    public readonly ctx: IGetContext
  ) {}
}
