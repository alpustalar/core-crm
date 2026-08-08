import { isTelegramChannelActive } from '@modules/messaging/channel-config/domain/rules/telegram-channel.rules';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CLINIC_TELEGRAM_CHANNEL_QUERY_REPOSITORY,
  IClinicTelegramChannelQueryRepository,
} from '@modules/messaging/channel-config/domain/repositories/clinic-telegram-channel.repository';
import { GetTelegramInboundRoutingQuery } from './get-telegram-inbound-routing.query';
import { GetTelegramInboundRoutingResponse } from './get-telegram-inbound-routing.response';

@QueryHandler(GetTelegramInboundRoutingQuery)
export class GetTelegramInboundRoutingHandler implements IQueryHandler<
  GetTelegramInboundRoutingQuery,
  GetTelegramInboundRoutingResponse
> {
  constructor(
    @Inject(CLINIC_TELEGRAM_CHANNEL_QUERY_REPOSITORY)
    private readonly channelQueryRepo: IClinicTelegramChannelQueryRepository
  ) {}

  async execute(
    query: GetTelegramInboundRoutingQuery
  ): Promise<GetTelegramInboundRoutingResponse> {
    const channel = await this.channelQueryRepo.findByClinicId(query.clinicId);
    if (!channel) return { data: null };

    return {
      data: {
        organizationId: channel.organizationId,
        webhookSecret: channel.webhookSecret,
        isActive: isTelegramChannelActive(channel),
      },
    };
  }
}
