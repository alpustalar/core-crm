import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetClinicInstagramChannelResponse } from './get-clinic-instagram-channel.response';

/** Bir kliniğin Instagram kanal config'ini döner (token maskeli); yoksa null. */
export class GetClinicInstagramChannelQuery implements IQuery {
  readonly __responseType!: GetClinicInstagramChannelResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
