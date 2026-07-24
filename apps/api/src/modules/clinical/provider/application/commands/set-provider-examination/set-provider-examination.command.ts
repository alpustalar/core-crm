import { IGetContext } from '@common/decorators/get-context.decorator';
import { SetProviderExamination } from '@shared';

export class SetProviderExaminationCommand {
  constructor(
    public readonly payload: {
      readonly providerId: string;
      readonly data: SetProviderExamination;
      readonly ctx: IGetContext;
    }
  ) {}
}
