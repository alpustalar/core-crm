import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CLINIC_INSTAGRAM_CHANNEL_QUERY_REPOSITORY,
  IClinicInstagramChannelQueryRepository,
} from '@modules/messaging/channel-config/domain/repositories/clinic-instagram-channel.repository';
import { FindInstagramChannelByIgUserIdQuery } from './find-instagram-channel-by-ig-user-id.query';
import { FindInstagramChannelByIgUserIdResponse } from './find-instagram-channel-by-ig-user-id.response';

@QueryHandler(FindInstagramChannelByIgUserIdQuery)
export class FindInstagramChannelByIgUserIdHandler implements IQueryHandler<
  FindInstagramChannelByIgUserIdQuery,
  FindInstagramChannelByIgUserIdResponse
> {
  constructor(
    @Inject(CLINIC_INSTAGRAM_CHANNEL_QUERY_REPOSITORY)
    private readonly channelQueryRepo: IClinicInstagramChannelQueryRepository
  ) {}

  async execute(
    query: FindInstagramChannelByIgUserIdQuery
  ): Promise<FindInstagramChannelByIgUserIdResponse> {
    const channel = await this.channelQueryRepo.findByIgUserId(query.igUserId);
    if (!channel) return { data: null };

    return {
      data: {
        clinicId: channel.clinicId,
        organizationId: channel.organizationId,
        isActive: channel.isActive,
      },
    };
  }
}
