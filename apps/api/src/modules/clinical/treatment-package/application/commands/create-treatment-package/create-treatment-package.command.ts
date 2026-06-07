import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateTreatmentPackageDto } from '@shared/modules/treatment-package/dto/command';

export class CreateTreatmentPackageCommand {
  constructor(
    public readonly dto: CreateTreatmentPackageDto,
    public readonly ctx: IGetContext
  ) {}
}
