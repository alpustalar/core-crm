import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicWhatsappChannelQueryRepository } from '@modules/messaging/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { ClinicWhatsappChannel as IClinicWhatsappChannel } from '@shared';

@Injectable()
export class ClinicWhatsappChannelQueryRepository
  extends BaseRepository
  implements IClinicWhatsappChannelQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByClinicId(clinicId: string): Promise<IClinicWhatsappChannel | null> {
    return this.db.clinicWhatsappChannel.findUnique({
      where: { clinicId },
    });
  }

  findByPhoneNumberId(
    phoneNumberId: string
  ): Promise<IClinicWhatsappChannel | null> {
    return this.db.clinicWhatsappChannel.findUnique({
      where: { phoneNumberId },
    });
  }
}
