import { IGetContext } from '@common/decorators/get-context.decorator';
import { FindPatientPackagesDto } from '@shared/modules/treatment-package/dto/queries';
import { IQuery } from '@nestjs/cqrs';
import { FindPatientPackagesResponse } from '@modules/clinical/treatment-package/application/queries/find-patient-packages/find-patient-packages.response';

export class FindPatientPackagesQuery implements IQuery {
  readonly __responseType!: FindPatientPackagesResponse;
  constructor(
    public readonly dto: FindPatientPackagesDto,
    public readonly ctx: IGetContext
  ) {}
}
