import { IGetContext } from '@common/decorators/get-context.decorator';
import type { FindTreatmentPackagesResponse } from '@modules/clinical/treatment-package/application/queries/find-treatment-packages/find-treatment-packages.response';
import { FindTreatmentPackages } from '@shared';

export class FindTreatmentPackagesQuery {
  public readonly __responseType!: FindTreatmentPackagesResponse;
  constructor(
    public readonly filter: FindTreatmentPackages,
    public readonly ctx: IGetContext
  ) {}
}
