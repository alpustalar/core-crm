import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetClinicWhatsappChannelResponse } from './get-clinic-whatsapp-channel.response';

/** Bir kliniğin WhatsApp kanal config'ini döner (credential'lar maskeli); yoksa null. */
export class GetClinicWhatsappChannelQuery implements IQuery {
  readonly __responseType!: GetClinicWhatsappChannelResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
