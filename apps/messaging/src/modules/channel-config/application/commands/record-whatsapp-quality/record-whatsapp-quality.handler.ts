import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MongoTransactionManager } from '@src/infrastructure/persistence/mongo/mongo-transaction.manager';
import {
  CLINIC_WHATSAPP_CHANNEL_COMMAND_REPOSITORY,
  IClinicWhatsappChannelCommandRepository,
} from '@modules/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { RecordWhatsappQualityCommand } from './record-whatsapp-quality.command';

@CommandHandler(RecordWhatsappQualityCommand)
export class RecordWhatsappQualityHandler implements ICommandHandler<
  RecordWhatsappQualityCommand,
  void
> {
  constructor(
    @Inject(CLINIC_WHATSAPP_CHANNEL_COMMAND_REPOSITORY)
    private readonly channelCommandRepo: IClinicWhatsappChannelCommandRepository,
    private readonly txManager: MongoTransactionManager
  ) {}

  async execute(command: RecordWhatsappQualityCommand): Promise<void> {
    const channel = await this.channelCommandRepo.findByDisplayPhoneNumber(
      command.displayPhoneNumber
    );
    // Bilinmeyen numara → yok say (başka WABA'ya ait olabilir).
    if (!channel) return;

    channel.recordHealth({
      qualityRating: command.qualityRating,
      messagingTier: command.messagingTier,
    });
    await this.txManager.run(() =>
      this.channelCommandRepo.upsertByClinicId(channel)
    );
  }
}
