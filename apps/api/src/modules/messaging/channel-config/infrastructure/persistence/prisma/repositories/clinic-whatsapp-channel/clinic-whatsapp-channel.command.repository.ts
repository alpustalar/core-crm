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

  async findByClinicId(
    clinicId: string
  ): Promise<ClinicWhatsappChannel | null> {
    const raw = await this.db.clinicWhatsappChannel.findUnique({
      where: { clinicId },
    });
    return raw ? new ClinicWhatsappChannel(raw) : null;
  }

  async findByDisplayPhoneNumber(
    displayPhoneNumber: string
  ): Promise<ClinicWhatsappChannel | null> {
    const raw = await this.db.clinicWhatsappChannel.findFirst({
      where: { displayPhoneNumber },
    });
    return raw ? new ClinicWhatsappChannel(raw) : null;
  }

  // 1:1 satellite (clinicId unique) → get-or-create (upsert).
  async upsertByClinicId(
    entity: ClinicWhatsappChannel
  ): Promise<ClinicWhatsappChannel> {
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
