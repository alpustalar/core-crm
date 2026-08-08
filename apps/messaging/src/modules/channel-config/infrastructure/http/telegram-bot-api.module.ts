import { Module } from '@nestjs/common';
import { TELEGRAM_BOT_API } from '@modules/channel-config/domain/interfaces/telegram-bot-api.interface';
import { TelegramBotApiService } from './telegram-bot-api.service';

@Module({
  providers: [{ provide: TELEGRAM_BOT_API, useClass: TelegramBotApiService }],
  exports: [TELEGRAM_BOT_API],
})
export class TelegramBotApiModule {}
