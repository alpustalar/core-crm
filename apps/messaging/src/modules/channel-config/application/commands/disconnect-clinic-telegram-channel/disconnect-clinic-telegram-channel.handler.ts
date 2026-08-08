import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { MongoTransactionManager } from '@src/infrastructure/persistence/mongo/mongo-transaction.manager';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import {
  ITelegramBotApi,
  TELEGRAM_BOT_API,
} from '@modules/channel-config/domain/interfaces/telegram-bot-api.interface';
import {
  CLINIC_TELEGRAM_CHANNEL_COMMAND_REPOSITORY,
  IClinicTelegramChannelCommandRepository,
} from '@modules/channel-config/domain/repositories/clinic-telegram-channel.repository';
import { DisconnectClinicTelegramChannelCommand } from './disconnect-clinic-telegram-channel.command';

@CommandHandler(DisconnectClinicTelegramChannelCommand)
export class DisconnectClinicTelegramChannelHandler implements ICommandHandler<
  DisconnectClinicTelegramChannelCommand,
  void
> {
  constructor(
    @Inject(CLINIC_TELEGRAM_CHANNEL_COMMAND_REPOSITORY)
    private readonly channelCommandRepo: IClinicTelegramChannelCommandRepository,
    @Inject(TELEGRAM_BOT_API)
    private readonly botApi: ITelegramBotApi,
    private readonly cipher: TokenCipherService,
    private readonly txManager: MongoTransactionManager
  ) {}

  async execute(
    command: DisconnectClinicTelegramChannelCommand
  ): Promise<void> {
    const channel = await this.channelCommandRepo.findByClinicId(
      command.clinicId
    );
    if (!channel) throw new NotFoundException('Telegram kanalı bulunamadı.');

    // Bot webhook'unu Telegram'dan kaldır (best-effort — deleteWebhook hatayı yutar).
    if (channel.botTokenEnc) {
      await this.botApi.deleteWebhook(this.cipher.decrypt(channel.botTokenEnc));
    }

    channel.revoke();
    await this.txManager.run(() =>
      this.channelCommandRepo.upsertByClinicAndProvider(channel)
    );
  }
}
