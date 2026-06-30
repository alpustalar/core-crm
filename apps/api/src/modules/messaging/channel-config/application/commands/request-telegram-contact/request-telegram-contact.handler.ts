import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import {
  ITelegramBotApi,
  TELEGRAM_BOT_API,
} from '@modules/messaging/channel-config/domain/interfaces/telegram-bot-api.interface';
import {
  CLINIC_TELEGRAM_CHANNEL_QUERY_REPOSITORY,
  IClinicTelegramChannelQueryRepository,
} from '@modules/messaging/channel-config/domain/repositories/clinic-telegram-channel.repository';
import { RequestTelegramContactCommand } from './request-telegram-contact.command';

const PROMPT_TEXT =
  'Size daha iyi yardımcı olabilmemiz için lütfen telefon numaranızı paylaşın.';
const BUTTON_TEXT = '📱 Numaramı paylaş';

@CommandHandler(RequestTelegramContactCommand)
export class RequestTelegramContactHandler
  implements ICommandHandler<RequestTelegramContactCommand, void>
{
  private readonly logger = new Logger(RequestTelegramContactHandler.name);

  constructor(
    @Inject(CLINIC_TELEGRAM_CHANNEL_QUERY_REPOSITORY)
    private readonly channelQueryRepo: IClinicTelegramChannelQueryRepository,
    @Inject(TELEGRAM_BOT_API)
    private readonly botApi: ITelegramBotApi,
    private readonly cipher: TokenCipherService
  ) {}

  async execute(command: RequestTelegramContactCommand): Promise<void> {
    const channel = await this.channelQueryRepo.findByClinicId(
      command.clinicId
    );
    if (!channel || !channel.isActive || !channel.botTokenEnc) return;

    // Best-effort: istem gönderilemese bile inbound akışını bloklamaz.
    try {
      await this.botApi.sendContactRequest(
        this.cipher.decrypt(channel.botTokenEnc),
        command.chatId,
        PROMPT_TEXT,
        BUTTON_TEXT
      );
    } catch (err) {
      this.logger.warn(
        `Telegram contact istemi gönderilemedi (clinic=${command.clinicId}): ${
          err instanceof Error ? err.message : err
        }`
      );
    }
  }
}
