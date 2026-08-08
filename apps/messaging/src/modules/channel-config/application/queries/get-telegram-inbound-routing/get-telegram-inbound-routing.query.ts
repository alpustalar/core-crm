import { IQuery } from '@nestjs/cqrs';
import { GetTelegramInboundRoutingResponse } from './get-telegram-inbound-routing.response';

/**
 * Telegram webhook routing: yol parametresindeki clinicId → kanalın organizationId +
 * webhookSecret + aktiflik. Internal: yalnızca webhook controller çağırır (ctx almaz).
 */
export class GetTelegramInboundRoutingQuery implements IQuery {
  readonly __responseType!: GetTelegramInboundRoutingResponse;
  constructor(public readonly clinicId: string) {}
}
