import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class GetLeadByIdQuery implements IQuery {
  constructor(
    public readonly leadId: string,
    public readonly ctx: IGetContext,
  ) {}
}
