import { IGetContext } from '@common/decorators/get-context.decorator';

export class DeleteTreatmentPackageCommand {
  constructor(
    public readonly packageId: string,
    public readonly ctx: IGetContext
  ) {}
}
