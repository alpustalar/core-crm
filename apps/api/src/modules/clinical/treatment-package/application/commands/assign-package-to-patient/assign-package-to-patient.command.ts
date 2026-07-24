import { IGetContext } from '@common/decorators/get-context.decorator';
import { AssignPackageToPatient } from '@shared';

export class AssignPackageToPatientCommand {
  constructor(
    public readonly data: AssignPackageToPatient,
    public readonly ctx: IGetContext
  ) {}
}
