import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  CLINIC_WHATSAPP_CHANNEL_COMMAND_REPOSITORY,
  IClinicWhatsappChannelCommandRepository,
} from '@modules/messaging/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { DisconnectClinicWhatsappChannelCommand } from './disconnect-clinic-whatsapp-channel.command';

@CommandHandler(DisconnectClinicWhatsappChannelCommand)
export class DisconnectClinicWhatsappChannelHandler
  implements ICommandHandler<DisconnectClinicWhatsappChannelCommand, void>
{
  constructor(
    @Inject(CLINIC_WHATSAPP_CHANNEL_COMMAND_REPOSITORY)
    private readonly channelCommandRepo: IClinicWhatsappChannelCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: DisconnectClinicWhatsappChannelCommand
  ): Promise<void> {
    const channel = await this.channelCommandRepo.findByClinicId(
      command.clinicId
    );
    if (!channel) throw new NotFoundException('WhatsApp kanalı bulunamadı.');

    channel.deactivate();
    await this.txManager.run(() =>
      this.channelCommandRepo.upsertByClinicId(channel)
    );
  }
}
