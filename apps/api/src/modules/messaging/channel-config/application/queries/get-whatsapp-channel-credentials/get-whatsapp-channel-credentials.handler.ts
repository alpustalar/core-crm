import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TokenCipherService } from '@common/crypto/token-cipher.service';
import {
  CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY,
  IClinicWhatsappChannelQueryRepository,
} from '@modules/messaging/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { GetWhatsappChannelCredentialsQuery } from './get-whatsapp-channel-credentials.query';
import { GetWhatsappChannelCredentialsResponse } from './get-whatsapp-channel-credentials.response';

@QueryHandler(GetWhatsappChannelCredentialsQuery)
export class GetWhatsappChannelCredentialsHandler
  implements
    IQueryHandler<
      GetWhatsappChannelCredentialsQuery,
      GetWhatsappChannelCredentialsResponse
    >
{
  constructor(
    @Inject(CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY)
    private readonly channelQueryRepo: IClinicWhatsappChannelQueryRepository,
    private readonly cipher: TokenCipherService
  ) {}

  async execute(
    query: GetWhatsappChannelCredentialsQuery
  ): Promise<GetWhatsappChannelCredentialsResponse> {
    const channel = await this.channelQueryRepo.findByClinicId(query.clinicId);
    if (!channel || !channel.isActive || !channel.accessToken) {
      return { data: null };
    }

    return {
      data: {
        phoneNumberId: channel.phoneNumberId,
        accessToken: this.cipher.decrypt(channel.accessToken),
        tokenExpiresAt: channel.tokenExpiresAt,
        wabaId: channel.wabaId,
      },
    };
  }
}
