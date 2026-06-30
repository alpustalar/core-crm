import { IQuery } from '@nestjs/cqrs';
import { FindInstagramChannelByIgUserIdResponse } from './find-instagram-channel-by-ig-user-id.response';

/**
 * Instagram webhook routing: gelen olaydaki IG hesap id'si (entry.id) → klinik. Internal:
 * yalnızca webhook controller çağırır (ctx almaz).
 */
export class FindInstagramChannelByIgUserIdQuery implements IQuery {
  readonly __responseType!: FindInstagramChannelByIgUserIdResponse;
  constructor(public readonly igUserId: string) {}
}
