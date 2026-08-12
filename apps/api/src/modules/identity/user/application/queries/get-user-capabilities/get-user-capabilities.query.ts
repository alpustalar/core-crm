import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetUserCapabilitiesResponse } from './get-user-capabilities.response';

export class GetUserCapabilitiesQuery implements IQuery {
  readonly __responseType!: GetUserCapabilitiesResponse;
  constructor(
    public readonly targetUserId: string,
    public readonly ctx: IGetContext
  ) {}
}
