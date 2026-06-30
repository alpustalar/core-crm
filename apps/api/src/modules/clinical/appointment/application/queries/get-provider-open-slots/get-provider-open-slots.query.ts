import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { FindProviderOpenSlotsInput } from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { GetProviderOpenSlotsResponse } from './get-provider-open-slots.response';

export class GetProviderOpenSlotsQuery implements IQuery {
  readonly __responseType!: GetProviderOpenSlotsResponse;

  constructor(
    public readonly input: FindProviderOpenSlotsInput,
    public readonly ctx: IGetContext
  ) {}
}
