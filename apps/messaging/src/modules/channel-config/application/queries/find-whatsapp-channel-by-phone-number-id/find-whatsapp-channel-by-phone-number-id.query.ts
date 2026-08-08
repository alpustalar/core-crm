import { IQuery } from '@nestjs/cqrs';
import { FindWhatsappChannelByPhoneNumberIdResponse } from './find-whatsapp-channel-by-phone-number-id.response';

/**
 * Webhook routing: Meta phone_number_id → klinik kanalı. Public webhook akışından
 * çağrılır (actor context yok); dolayısıyla ctx almaz.
 */
export class FindWhatsappChannelByPhoneNumberIdQuery implements IQuery {
  readonly __responseType!: FindWhatsappChannelByPhoneNumberIdResponse;
  constructor(public readonly phoneNumberId: string) {}
}
