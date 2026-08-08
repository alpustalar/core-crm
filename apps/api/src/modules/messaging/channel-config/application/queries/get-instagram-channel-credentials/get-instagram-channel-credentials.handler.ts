import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import {
  CLINIC_INSTAGRAM_CHANNEL_QUERY_REPOSITORY,
  IClinicInstagramChannelQueryRepository,
} from '@modules/messaging/channel-config/domain/repositories/clinic-instagram-channel.repository';
import { GetInstagramChannelCredentialsQuery } from './get-instagram-channel-credentials.query';
import { GetInstagramChannelCredentialsResponse } from './get-instagram-channel-credentials.response';

@QueryHandler(GetInstagramChannelCredentialsQuery)
export class GetInstagramChannelCredentialsHandler implements IQueryHandler<
  GetInstagramChannelCredentialsQuery,
  GetInstagramChannelCredentialsResponse
> {
  constructor(
    @Inject(CLINIC_INSTAGRAM_CHANNEL_QUERY_REPOSITORY)
    private readonly channelQueryRepo: IClinicInstagramChannelQueryRepository,
    private readonly cipher: TokenCipherService
  ) {}

  async execute(
    query: GetInstagramChannelCredentialsQuery
  ): Promise<GetInstagramChannelCredentialsResponse> {
    const channel = await this.channelQueryRepo.findByClinicId(query.clinicId);
    if (!channel || !channel.isActive || !channel.accessToken) {
      return { data: null };
    }

    return {
      data: {
        igUserId: channel.igUserId,
        accessToken: this.cipher.decrypt(channel.accessToken),
        tokenExpiresAt: channel.tokenExpiresAt,
      },
    };
  }
}
