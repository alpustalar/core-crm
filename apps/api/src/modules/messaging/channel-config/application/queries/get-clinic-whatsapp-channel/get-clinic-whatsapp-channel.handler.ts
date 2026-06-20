import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY,
  IClinicWhatsappChannelQueryRepository,
} from '@modules/messaging/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { GetClinicWhatsappChannelQuery } from './get-clinic-whatsapp-channel.query';
import { GetClinicWhatsappChannelResponse } from './get-clinic-whatsapp-channel.response';

@QueryHandler(GetClinicWhatsappChannelQuery)
export class GetClinicWhatsappChannelHandler
  implements
    IQueryHandler<
      GetClinicWhatsappChannelQuery,
      GetClinicWhatsappChannelResponse
    >
{
  constructor(
    @Inject(CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY)
    private readonly channelQueryRepo: IClinicWhatsappChannelQueryRepository
  ) {}

  async execute(
    query: GetClinicWhatsappChannelQuery
  ): Promise<GetClinicWhatsappChannelResponse> {
    const channel = await this.channelQueryRepo.findByClinicId(query.clinicId);
    if (!channel) return { data: null };

    return {
      data: {
        id: channel.id,
        clinicId: channel.clinicId,
        phoneNumberId: channel.phoneNumberId,
        wabaId: channel.wabaId,
        displayPhoneNumber: channel.displayPhoneNumber,
        hasAccessToken: channel.accessToken !== null,
        isActive: channel.isActive,
        needsReauth: channel.needsReauth(),
        tokenExpiresAt: channel.tokenExpiresAt,
        qualityRating: channel.qualityRating,
        messagingTier: channel.messagingTier,
        createdAt: channel.createdAt,
        updatedAt: channel.updatedAt,
      },
    };
  }
}
