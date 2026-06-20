import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { TokenCipherService } from '@common/crypto/token-cipher.service';
import {
  IWhatsappCloudApi,
  WHATSAPP_CLOUD_API,
} from '@modules/messaging/channel-config/domain/interfaces/whatsapp-cloud-api.interface';
import {
  CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY,
  IClinicWhatsappChannelQueryRepository,
} from '@modules/messaging/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { UpdateWhatsappBusinessProfileCommand } from './update-whatsapp-business-profile.command';

@CommandHandler(UpdateWhatsappBusinessProfileCommand)
export class UpdateWhatsappBusinessProfileHandler
  implements ICommandHandler<UpdateWhatsappBusinessProfileCommand, void>
{
  constructor(
    @Inject(CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY)
    private readonly channelQueryRepo: IClinicWhatsappChannelQueryRepository,
    @Inject(WHATSAPP_CLOUD_API)
    private readonly cloudApi: IWhatsappCloudApi,
    private readonly cipher: TokenCipherService
  ) {}

  async execute(command: UpdateWhatsappBusinessProfileCommand): Promise<void> {
    const channel = await this.channelQueryRepo.findByClinicId(
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
