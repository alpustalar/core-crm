import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CLINIC_INSTAGRAM_CHANNEL_QUERY_REPOSITORY,
  IClinicInstagramChannelQueryRepository,
} from '@modules/messaging/channel-config/domain/repositories/clinic-instagram-channel.repository';
import { GetClinicInstagramChannelQuery } from './get-clinic-instagram-channel.query';
import { GetClinicInstagramChannelResponse } from './get-clinic-instagram-channel.response';

@QueryHandler(GetClinicInstagramChannelQuery)
export class GetClinicInstagramChannelHandler
  implements
    IQueryHandler<
      GetClinicInstagramChannelQuery,
      GetClinicInstagramChannelResponse
    >
{
  constructor(
    @Inject(CLINIC_INSTAGRAM_CHANNEL_QUERY_REPOSITORY)
    private readonly channelQueryRepo: IClinicInstagramChannelQueryRepository
  ) {}

  async execute(
    query: GetClinicInstagramChannelQuery
  ): Promise<GetClinicInstagramChannelResponse> {
    const channel = await this.channelQueryRepo.findByClinicId(query.clinicId);
    if (!channel) return { data: null };

    return {
      data: {
        id: channel.id,
        clinicId: channel.clinicId,
        igUserId: channel.igUserId,
        pageId: channel.pageId,
        username: channel.username,
        hasAccessToken: channel.accessToken !== null,
        isActive: channel.isActive,
        lastError: channel.lastError,
        createdAt: channel.createdAt,
        updatedAt: channel.updatedAt,
      },
    };
  }
}
