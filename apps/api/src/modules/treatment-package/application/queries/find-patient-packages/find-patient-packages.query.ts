import { IGetContext } from '@common/decorators/get-context.decorator';
import { FindPatientPackagesDto } from '@shared/modules/treatment-package/dto/queries';

export class FindPatientPackagesQuery {
  constructor(
    public readonly dto: FindPatientPackagesDto,
    public readonly ctx: IGetContext
  ) {}
}
