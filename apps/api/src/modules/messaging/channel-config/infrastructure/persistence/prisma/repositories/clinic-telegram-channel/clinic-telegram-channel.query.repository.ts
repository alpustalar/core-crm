import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicTelegramChannelQueryRepository } from '@modules/messaging/channel-config/domain/repositories/clinic-telegram-channel.repository';
import { ClinicTelegramChannel } from '@modules/messaging/channel-config/domain/entities/clinic-telegram-channel.entity';

@Injectable()
export class ClinicTelegramChannelQueryRepository
  extends BaseRepository
  implements IClinicTelegramChannelQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByClinicId(
    clinicId: string
  ): Promise<ClinicTelegramChannel | null> {
    // Klinik başına tek kanal (şu an yalnız BOT_API); provider çoğullanırsa filtre eklenir.
    const raw = await this.db.clinicTelegramChannel.findFirst({
      where: { clinicId },
    });
    return raw ? new ClinicTelegramChannel(raw) : null;
  }
}
