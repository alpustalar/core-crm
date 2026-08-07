import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicInstagramChannelQueryRepository } from '@modules/messaging/channel-config/domain/repositories/clinic-instagram-channel.repository';
import { ClinicInstagramChannel as IClinicInstagramChannel } from '@shared';

@Injectable()
export class ClinicInstagramChannelQueryRepository
  extends BaseRepository
  implements IClinicInstagramChannelQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByClinicId(clinicId: string): Promise<IClinicInstagramChannel | null> {
    return this.db.clinicInstagramChannel.findUnique({
      where: { clinicId },
    });
  }

  findByIgUserId(igUserId: string): Promise<IClinicInstagramChannel | null> {
    return this.db.clinicInstagramChannel.findUnique({
      where: { igUserId },
    });
  }
}
