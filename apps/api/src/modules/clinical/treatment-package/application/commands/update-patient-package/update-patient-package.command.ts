import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpdatePatientPackage } from '@shared';

export interface UpdatePatientPackageCommandPayload {
  patientPackageId: string;
  data: UpdatePatientPackage;
}

export class UpdatePatientPackageCommand {
  constructor(
    public readonly payload: UpdatePatientPackageCommandPayload,
    public readonly ctx: IGetContext
  ) {}
}
