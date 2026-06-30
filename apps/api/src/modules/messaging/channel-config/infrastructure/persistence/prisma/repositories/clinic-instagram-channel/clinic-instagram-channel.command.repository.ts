import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicInstagramChannelCommandRepository } from '@modules/messaging/channel-config/domain/repositories/clinic-instagram-channel.repository';
import { ClinicInstagramChannel } from '@modules/messaging/channel-config/domain/entities/clinic-instagram-channel.entity';

@Injectable()
export class ClinicInstagramChannelCommandRepository
  extends BaseRepository
  implements IClinicInstagramChannelCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(
    entity: ClinicInstagramChannel
  ): Promise<ClinicInstagramChannel> {
    const data = entity.toPersistence();
    const raw = await this.db.clinicInstagramChannel.upsert({
      where: { clinicId: data.clinicId },
      create: data,
      update: {
        igUserId: data.igUserId,
        pageId: data.pageId,
        username: data.username,
        accessToken: data.accessToken,
        isActive: data.isActive,
        tokenExpiresAt: data.tokenExpiresAt,
        lastError: data.lastError,
      },
    });
    entity.flushEvents();
    return new ClinicInstagramChannel(raw);
  }
}
