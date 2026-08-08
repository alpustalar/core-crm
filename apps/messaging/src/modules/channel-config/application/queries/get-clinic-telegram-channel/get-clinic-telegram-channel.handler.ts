import { isTelegramChannelActive } from '@modules/channel-config/domain/rules/telegram-channel.rules';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CLINIC_TELEGRAM_CHANNEL_QUERY_REPOSITORY,
  IClinicTelegramChannelQueryRepository,
} from '@modules/channel-config/domain/repositories/clinic-telegram-channel.repository';
import { GetClinicTelegramChannelQuery } from './get-clinic-telegram-channel.query';
import { GetClinicTelegramChannelResponse } from './get-clinic-telegram-channel.response';

@QueryHandler(GetClinicTelegramChannelQuery)
export class GetClinicTelegramChannelHandler implements IQueryHandler<
  GetClinicTelegramChannelQuery,
  GetClinicTelegramChannelResponse
> {
  constructor(
    @Inject(CLINIC_TELEGRAM_CHANNEL_QUERY_REPOSITORY)
    private readonly channelQueryRepo: IClinicTelegramChannelQueryRepository
  ) {}

  async execute(
    query: GetClinicTelegramChannelQuery
  ): Promise<GetClinicTelegramChannelResponse> {
    const channel = await this.channelQueryRepo.findByClinicId(query.clinicId);
    if (!channel) return { data: null };

    return {
      data: {
        id: channel.id,
        clinicId: channel.clinicId,
        provider: channel.provider,
        status: channel.status,
        botUsername: channel.botUsername,
        hasBotToken: channel.botTokenEnc !== null,
        isActive: isTelegramChannelActive(channel),
        lastError: channel.lastError,
        createdAt: channel.createdAt,
        updatedAt: channel.updatedAt,
      },
    };
  }
}
