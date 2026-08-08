import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetWhatsappChannelHealthResponse } from './get-whatsapp-channel-health.response';

/** Kliniğin numarasının canlı sağlık/kalite bilgisini (Graph API'den) döner. */
export class GetWhatsappChannelHealthQuery implements IQuery {
  readonly __responseType!: GetWhatsappChannelHealthResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
