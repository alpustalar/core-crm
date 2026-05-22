import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpdateTreatmentPackageDto } from '@shared/modules/treatment-package/dto/command';

export class UpdateTreatmentPackageCommand {
  constructor(
    public readonly packageId: string,
    public readonly dto: UpdateTreatmentPackageDto,
    public readonly ctx: IGetContext
  ) {}
}
