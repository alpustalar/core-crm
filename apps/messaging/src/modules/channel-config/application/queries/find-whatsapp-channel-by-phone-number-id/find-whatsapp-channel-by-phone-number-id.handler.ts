import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY,
  IClinicWhatsappChannelQueryRepository,
} from '@modules/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { FindWhatsappChannelByPhoneNumberIdQuery } from './find-whatsapp-channel-by-phone-number-id.query';
import { FindWhatsappChannelByPhoneNumberIdResponse } from './find-whatsapp-channel-by-phone-number-id.response';

@QueryHandler(FindWhatsappChannelByPhoneNumberIdQuery)
export class FindWhatsappChannelByPhoneNumberIdHandler implements IQueryHandler<
  FindWhatsappChannelByPhoneNumberIdQuery,
  FindWhatsappChannelByPhoneNumberIdResponse
> {
  constructor(
    @Inject(CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY)
    private readonly channelQueryRepo: IClinicWhatsappChannelQueryRepository
  ) {}

  async execute(
    query: FindWhatsappChannelByPhoneNumberIdQuery
  ): Promise<FindWhatsappChannelByPhoneNumberIdResponse> {
    const channel = await this.channelQueryRepo.findByPhoneNumberId(
      query.phoneNumberId
    );
    if (!channel) return { data: null };

    return {
      data: {
        id: channel.id,
        clinicId: channel.clinicId,
        organizationId: channel.organizationId,
        phoneNumberId: channel.phoneNumberId,
        isActive: channel.isActive,
      },
    };
  }
}
