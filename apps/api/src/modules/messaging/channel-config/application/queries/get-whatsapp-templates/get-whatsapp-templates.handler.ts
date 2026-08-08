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
import { GetWhatsappTemplatesQuery } from './get-whatsapp-templates.query';
import { GetWhatsappTemplatesResponse } from './get-whatsapp-templates.response';

@QueryHandler(GetWhatsappTemplatesQuery)
export class GetWhatsappTemplatesHandler implements IQueryHandler<
  GetWhatsappTemplatesQuery,
  GetWhatsappTemplatesResponse
> {
  constructor(
    @Inject(CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY)
    private readonly channelQueryRepo: IClinicWhatsappChannelQueryRepository,
    @Inject(WHATSAPP_CLOUD_API)
    private readonly cloudApi: IWhatsappCloudApi,
    private readonly cipher: TokenCipherService
  ) {}

  async execute(
    query: GetWhatsappTemplatesQuery
  ): Promise<GetWhatsappTemplatesResponse> {
    const channel = await this.channelQueryRepo.findByClinicId(query.clinicId);
    if (
      !channel ||
      !channel.isActive ||
      !channel.accessToken ||
      !channel.wabaId
    ) {
      return { data: [] };
    }

    const token = this.cipher.decrypt(channel.accessToken);
    const templates = await this.cloudApi.listMessageTemplates(
      channel.wabaId,
      token
    );

    return {
      data: templates.map((t) => ({
        name: t.name,
        language: t.language,
        status: t.status,
        category: t.category,
        components: t.components,
      })),
    };
  }
}
