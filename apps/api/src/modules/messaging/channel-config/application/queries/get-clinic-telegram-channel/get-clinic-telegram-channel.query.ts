import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetClinicTelegramChannelResponse } from './get-clinic-telegram-channel.response';

/** Bir kliniğin Telegram kanal config'ini döner (bot token maskeli); yoksa null. */
export class GetClinicTelegramChannelQuery implements IQuery {
  readonly __responseType!: GetClinicTelegramChannelResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
