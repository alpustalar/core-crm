import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpdatePatientPackageDto } from '@shared/modules/treatment-package/dto/command';

export class UpdatePatientPackageCommand {
  constructor(
    public readonly patientPackageId: string,
    public readonly dto: UpdatePatientPackageDto,
    public readonly ctx: IGetContext
  ) {}
}
