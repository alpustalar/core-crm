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
import { FetchWhatsappMediaQuery } from './fetch-whatsapp-media.query';
import { FetchWhatsappMediaResponse } from './fetch-whatsapp-media.response';

@QueryHandler(FetchWhatsappMediaQuery)
export class FetchWhatsappMediaHandler implements IQueryHandler<
  FetchWhatsappMediaQuery,
  FetchWhatsappMediaResponse
> {
  constructor(
    @Inject(CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY)
    private readonly channelQueryRepo: IClinicWhatsappChannelQueryRepository,
    @Inject(WHATSAPP_CLOUD_API)
    private readonly cloudApi: IWhatsappCloudApi,
    private readonly cipher: TokenCipherService
  ) {}

  async execute(
    query: FetchWhatsappMediaQuery
  ): Promise<FetchWhatsappMediaResponse> {
    const channel = await this.channelQueryRepo.findByClinicId(query.clinicId);
    if (!channel || !channel.isActive || !channel.accessToken) {
      return { data: null };
    }

    const accessToken = this.cipher.decrypt(channel.accessToken);
    const media = await this.cloudApi.fetchMedia(query.mediaId, accessToken);
    return { data: media };
  }
}
