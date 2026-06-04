import { IGetContext } from '@common/decorators/get-context.decorator';

export class SoftDeleteClinicCommand {
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
