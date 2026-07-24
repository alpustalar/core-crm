import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { FindPatientPackagesResponse } from '@modules/clinical/treatment-package/application/queries/find-patient-packages/find-patient-packages.response';
import { FindPatientPackages } from '@shared';

export class FindPatientPackagesQuery implements IQuery {
  readonly __responseType!: FindPatientPackagesResponse;
  constructor(
    public readonly filter: FindPatientPackages,
    public readonly ctx: IGetContext
  ) {}
}
