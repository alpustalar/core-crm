import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetPartyByIdResponse } from './get-party-by-id.response';

export class GetPartyByIdQuery implements IQuery {
  readonly __responseType!: GetPartyByIdResponse;
  constructor(
    public readonly partyId: string,
    public readonly ctx: IGetContext
  ) {}
}
