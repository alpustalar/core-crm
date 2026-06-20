import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicWhatsappChannelCommandRepository } from '@modules/messaging/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { ClinicWhatsappChannel } from '@modules/messaging/channel-config/domain/entities/clinic-whatsapp-channel.entity';

@Injectable()
export class ClinicWhatsappChannelCommandRepository
  extends BaseRepository
  implements IClinicWhatsappChannelCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(entity: ClinicWhatsappChannel): Promise<ClinicWhatsappChannel> {
    const data = entity.toPersistence();
    const raw = await this.db.clinicWhatsappChannel.upsert({
      where: { clinicId: data.clinicId },
      create: data,
      update: {
        phoneNumberId: data.phoneNumberId,
        wabaId: data.wabaId,
        displayPhoneNumber: data.displayPhoneNumber,
        accessToken: data.accessToken,
        verifyToken: data.verifyToken,
        isActive: data.isActive,
        registrationPin: data.registrationPin,
        registeredAt: data.registeredAt,
        tokenExpiresAt: data.tokenExpiresAt,
        qualityRating: data.qualityRating,
        messagingTier: data.messagingTier,
      },
    });
    entity.flushEvents();
    return new ClinicWhatsappChannel(raw);
  }
}
