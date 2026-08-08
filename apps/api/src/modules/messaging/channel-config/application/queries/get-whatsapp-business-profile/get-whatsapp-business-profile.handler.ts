import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import {
  IWhatsappCloudApi,
  WHATSAPP_CLOUD_API,
} from '@modules/messaging/channel-config/domain/interfaces/whatsapp-cloud-api.interface';
import {
  CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY,
  IClinicWhatsappChannelQueryRepository,
} from '@modules/messaging/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { GetWhatsappBusinessProfileQuery } from './get-whatsapp-business-profile.query';
import { GetWhatsappBusinessProfileResponse } from './get-whatsapp-business-profile.response';

@QueryHandler(GetWhatsappBusinessProfileQuery)
export class GetWhatsappBusinessProfileHandler implements IQueryHandler<
  GetWhatsappBusinessProfileQuery,
  GetWhatsappBusinessProfileResponse
> {
  constructor(
    @Inject(CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY)
    private readonly channelQueryRepo: IClinicWhatsappChannelQueryRepository,
    @Inject(WHATSAPP_CLOUD_API)
    private readonly cloudApi: IWhatsappCloudApi,
    private readonly cipher: TokenCipherService
  ) {}

  async execute(
    query: GetWhatsappBusinessProfileQuery
  ): Promise<GetWhatsappBusinessProfileResponse> {
    const channel = await this.channelQueryRepo.findByClinicId(query.clinicId);
    if (!channel || !channel.isActive || !channel.accessToken) {
      return { data: null };
    }

    const token = this.cipher.decrypt(channel.accessToken);
    const profile = await this.cloudApi.getBusinessProfile(
      channel.phoneNumberId,
      token
    );

    return { data: profile };
  }
}
