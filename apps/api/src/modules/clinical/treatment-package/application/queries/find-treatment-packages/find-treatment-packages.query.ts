import { IGetContext } from '@common/decorators/get-context.decorator';
import { FindTreatmentPackagesDto } from '@shared/modules/treatment-package/dto/queries';

export class FindTreatmentPackagesQuery {
  constructor(
    public readonly dto: FindTreatmentPackagesDto,
    public readonly ctx: IGetContext
  ) {}
}
