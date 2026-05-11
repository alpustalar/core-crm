import { IGetContext } from '@common/decorators/get-context.decorator';

export class SoftDeleteManyUsersByClinicIdCommand {
  constructor(
    public readonly clinicId: string,
    public readonly context: IGetContext
  ) {}
}
