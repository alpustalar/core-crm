import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import {
  IWhatsappCloudApi,
  WHATSAPP_CLOUD_API,
} from '@modules/messaging/channel-config/domain/interfaces/whatsapp-cloud-api.interface';
import {
  CLINIC_WHATSAPP_CHANNEL_COMMAND_REPOSITORY,
  IClinicWhatsappChannelCommandRepository,
} from '@modules/messaging/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { UpdateWhatsappBusinessProfileCommand } from './update-whatsapp-business-profile.command';

@CommandHandler(UpdateWhatsappBusinessProfileCommand)
export class UpdateWhatsappBusinessProfileHandler
  implements ICommandHandler<UpdateWhatsappBusinessProfileCommand, void>
{
  constructor(
    // Token dış API çağrısını besliyor → Command Context (bkz. repo arayüzü notu).
    @Inject(CLINIC_WHATSAPP_CHANNEL_COMMAND_REPOSITORY)
    private readonly channelCommandRepo: IClinicWhatsappChannelCommandRepository,
    @Inject(WHATSAPP_CLOUD_API)
    private readonly cloudApi: IWhatsappCloudApi,
    private readonly cipher: TokenCipherService
  ) {}

  async execute(command: UpdateWhatsappBusinessProfileCommand): Promise<void> {
    const channel = await this.channelCommandRepo.findByClinicId(
      command.clinicId
    );
    if (!channel || !channel.isActive || !channel.accessToken) {
      throw new NotFoundException('Aktif WhatsApp kanalı bulunamadı.');
    }

    const token = this.cipher.decrypt(channel.accessToken);
    await this.cloudApi.updateBusinessProfile(
      channel.phoneNumberId,
      token,
      command.input
    );
  }
}
