import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicTelegramChannelCommandRepository } from '@modules/messaging/channel-config/domain/repositories/clinic-telegram-channel.repository';
import { ClinicTelegramChannel } from '@modules/messaging/channel-config/domain/entities/clinic-telegram-channel.entity';

@Injectable()
export class ClinicTelegramChannelCommandRepository
  extends BaseRepository
  implements IClinicTelegramChannelCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(entity: ClinicTelegramChannel): Promise<ClinicTelegramChannel> {
    const data = entity.toPersistence();
    const raw = await this.db.clinicTelegramChannel.upsert({
      where: {
        clinicId_provider: {
          clinicId: data.clinicId,
          provider: data.provider,
        },
      },
      create: data,
      update: {
        status: data.status,
        botTokenEnc: data.botTokenEnc,
        botUsername: data.botUsername,
        webhookSecret: data.webhookSecret,
        phoneNumber: data.phoneNumber,
        mtprotoSessionEnc: data.mtprotoSessionEnc,
        lastError: data.lastError,
      },
    });
    entity.flushEvents();
    return new ClinicTelegramChannel(raw);
  }
}
