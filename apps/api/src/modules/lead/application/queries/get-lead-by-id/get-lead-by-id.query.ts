import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetLeadByIdResponse } from './get-lead-by-id.response';

export class GetLeadByIdQuery implements IQuery {
  readonly __responseType!: GetLeadByIdResponse;
  constructor(
    public readonly leadId: string,
    public readonly ctx: IGetContext,
  ) {}
}
