import { IQuery } from '@nestjs/cqrs';
import { GetWhatsappChannelCredentialsResponse } from './get-whatsapp-channel-credentials.response';

/**
 * Bir kliniğin WhatsApp gönderim credential'ını (phoneNumberId + decrypted accessToken)
 * döner. Internal: yalnızca kanal adapter'ı / outbound kuyruğu çağırır (ctx almaz).
 */
export class GetWhatsappChannelCredentialsQuery implements IQuery {
  readonly __responseType!: GetWhatsappChannelCredentialsResponse;
  constructor(public readonly clinicId: string) {}
}
