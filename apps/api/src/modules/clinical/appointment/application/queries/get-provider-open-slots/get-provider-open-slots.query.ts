import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetProviderOpenSlotsResponse } from './get-provider-open-slots.response';
import { FindProviderOpenSlotsInput } from '@modules/clinical/appointment/domain/contracts/appointment';

export class GetProviderOpenSlotsQuery implements IQuery {
  readonly __responseType!: GetProviderOpenSlotsResponse;

  constructor(
    public readonly filter: FindProviderOpenSlotsInput,
    public readonly ctx: IGetContext
  ) {}
}
