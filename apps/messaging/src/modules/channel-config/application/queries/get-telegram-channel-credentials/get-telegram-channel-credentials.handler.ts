import { isTelegramChannelActive } from '@modules/channel-config/domain/rules/telegram-channel.rules';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import {
  CLINIC_TELEGRAM_CHANNEL_QUERY_REPOSITORY,
  IClinicTelegramChannelQueryRepository,
} from '@modules/channel-config/domain/repositories/clinic-telegram-channel.repository';
import { GetTelegramChannelCredentialsQuery } from './get-telegram-channel-credentials.query';
import { GetTelegramChannelCredentialsResponse } from './get-telegram-channel-credentials.response';

@QueryHandler(GetTelegramChannelCredentialsQuery)
export class GetTelegramChannelCredentialsHandler implements IQueryHandler<
  GetTelegramChannelCredentialsQuery,
  GetTelegramChannelCredentialsResponse
> {
  constructor(
    @Inject(CLINIC_TELEGRAM_CHANNEL_QUERY_REPOSITORY)
    private readonly channelQueryRepo: IClinicTelegramChannelQueryRepository,
    private readonly cipher: TokenCipherService
  ) {}

  async execute(
    query: GetTelegramChannelCredentialsQuery
  ): Promise<GetTelegramChannelCredentialsResponse> {
    const channel = await this.channelQueryRepo.findByClinicId(query.clinicId);
    if (!channel || !isTelegramChannelActive(channel) || !channel.botTokenEnc) {
      return { data: null };
    }

    return {
      data: { botToken: this.cipher.decrypt(channel.botTokenEnc) },
    };
  }
}
