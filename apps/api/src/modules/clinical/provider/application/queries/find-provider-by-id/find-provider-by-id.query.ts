import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { FindProviderByIdQueryResponse } from '@modules/clinical/provider/application/queries/find-provider-by-id/find-provider-by-id.response';

export class FindProviderByIdQuery implements IQuery {
  readonly __responseType!: FindProviderByIdQueryResponse;
  constructor(
    public readonly providerId: string,
    public readonly ctx: IGetContext
  ) {}
}
