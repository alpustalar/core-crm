import { IGetContext } from '@common/decorators/get-context.decorator';

export class SoftDeleteProviderByClinicIdCommand {
  constructor(
    public readonly providerId: string,
    public readonly context: IGetContext
  ) {}
}
