import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicWhatsappChannelQueryRepository } from '@modules/messaging/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { ClinicWhatsappChannel } from '@modules/messaging/channel-config/domain/entities/clinic-whatsapp-channel.entity';

@Injectable()
export class ClinicWhatsappChannelQueryRepository
  extends BaseRepository
  implements IClinicWhatsappChannelQueryRepository
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

  async findByPhoneNumberId(
    phoneNumberId: string
  ): Promise<ClinicWhatsappChannel | null> {
    const raw = await this.db.clinicWhatsappChannel.findUnique({
      where: { phoneNumberId },
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
}
