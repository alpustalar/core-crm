import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetInboundMediaResponse } from './get-inbound-media.response';

/**
 * Bir mesajın gelen medyasını anlık (proxy) döner — saklanmaz, Meta'dan taze çekilir.
 * Mesaj/yazışma klinik sahipliği doğrulanır, media id referanstan çözülür.
 */
export class GetInboundMediaQuery implements IQuery {
  readonly __responseType!: GetInboundMediaResponse;
  constructor(
    public readonly payload: {
      clinicId: string;
      conversationId: string;
      messageId: string;
      ctx: IGetContext;
    }
  ) {}
}
