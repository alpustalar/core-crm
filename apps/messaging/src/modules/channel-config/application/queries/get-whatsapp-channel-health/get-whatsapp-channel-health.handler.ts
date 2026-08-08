import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import {
  IWhatsappCloudApi,
  WHATSAPP_CLOUD_API,
} from '@modules/channel-config/domain/interfaces/whatsapp-cloud-api.interface';
import {
  CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY,
  IClinicWhatsappChannelQueryRepository,
} from '@modules/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { GetWhatsappChannelHealthQuery } from './get-whatsapp-channel-health.query';
import { GetWhatsappChannelHealthResponse } from './get-whatsapp-channel-health.response';

@QueryHandler(GetWhatsappChannelHealthQuery)
export class GetWhatsappChannelHealthHandler implements IQueryHandler<
  GetWhatsappChannelHealthQuery,
  GetWhatsappChannelHealthResponse
> {
  constructor(
    @Inject(CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY)
    private readonly channelQueryRepo: IClinicWhatsappChannelQueryRepository,
    @Inject(WHATSAPP_CLOUD_API)
    private readonly cloudApi: IWhatsappCloudApi,
    private readonly cipher: TokenCipherService
  ) {}

  async execute(
    query: GetWhatsappChannelHealthQuery
  ): Promise<GetWhatsappChannelHealthResponse> {
    const channel = await this.channelQueryRepo.findByClinicId(query.clinicId);
    if (!channel || !channel.isActive || !channel.accessToken) {
      return { data: null };
    }

    const token = this.cipher.decrypt(channel.accessToken);
    const health = await this.cloudApi.getPhoneNumberHealth(
      channel.phoneNumberId,
      token
    );

    return {
      data: {
        phoneNumberId: channel.phoneNumberId,
        displayPhoneNumber: health.displayPhoneNumber,
        verifiedName: health.verifiedName,
        qualityRating: health.qualityRating,
        messagingTier: health.messagingTier,
        nameStatus: health.nameStatus,
        codeVerificationStatus: health.codeVerificationStatus,
      },
    };
  }
}
