import { IGetContext } from '@common/decorators/get-context.decorator';
import { AssignPackageToPatientDto } from '@shared/modules/treatment-package/dto/command';

export class AssignPackageToPatientCommand {
  constructor(
    public readonly dto: AssignPackageToPatientDto,
    public readonly ctx: IGetContext
  ) {}
}
