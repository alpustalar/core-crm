import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicInstagramChannelQueryRepository } from '@modules/messaging/channel-config/domain/repositories/clinic-instagram-channel.repository';
import { ClinicInstagramChannel } from '@modules/messaging/channel-config/domain/entities/clinic-instagram-channel.entity';

@Injectable()
export class ClinicInstagramChannelQueryRepository
  extends BaseRepository
  implements IClinicInstagramChannelQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByClinicId(
    clinicId: string
  ): Promise<ClinicInstagramChannel | null> {
    const raw = await this.db.clinicInstagramChannel.findUnique({
      where: { clinicId },
    });
    return raw ? new ClinicInstagramChannel(raw) : null;
  }

  async findByIgUserId(
    igUserId: string
  ): Promise<ClinicInstagramChannel | null> {
    const raw = await this.db.clinicInstagramChannel.findUnique({
      where: { igUserId },
    });
    return raw ? new ClinicInstagramChannel(raw) : null;
  }
}
