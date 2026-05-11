import { IGetContext } from '@common/decorators/get-context.decorator';

export class FindProviderByIdQuery {
  constructor(
    public readonly providerId: string,
    public readonly context: IGetContext
  ) {}
}
