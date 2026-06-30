import { IQuery } from '@nestjs/cqrs';
import { GetInstagramChannelCredentialsResponse } from './get-instagram-channel-credentials.response';

/**
 * Bir kliniğin Instagram gönderim credential'ını (igUserId + decrypted accessToken) döner.
 * Internal: yalnızca kanal adapter'ı / outbound kuyruğu çağırır (ctx almaz).
 */
export class GetInstagramChannelCredentialsQuery implements IQuery {
  readonly __responseType!: GetInstagramChannelCredentialsResponse;
  constructor(public readonly clinicId: string) {}
}
