import { IQuery } from '@nestjs/cqrs';
import { GetTelegramChannelCredentialsResponse } from './get-telegram-channel-credentials.response';

/**
 * Bir kliniğin Telegram gönderim credential'ını (decrypted botToken) döner. Internal:
 * yalnızca kanal adapter'ı / outbound kuyruğu çağırır (ctx almaz).
 */
export class GetTelegramChannelCredentialsQuery implements IQuery {
  readonly __responseType!: GetTelegramChannelCredentialsResponse;
  constructor(public readonly clinicId: string) {}
}
