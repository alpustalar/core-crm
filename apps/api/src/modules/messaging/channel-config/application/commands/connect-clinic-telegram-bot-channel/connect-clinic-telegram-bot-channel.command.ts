import { IGetContext } from '@common/decorators';

export interface ConnectClinicTelegramBotChannelInput {
  /** BotFather'dan alınan bot token'ı. */
  botToken: string;
}

/**
 * Self-service: klinik kendi Telegram botunu (BotFather token) bağlar. Token getMe ile
 * doğrulanır, klinik bazlı gizli webhook secret_token üretilip setWebhook ile kurulur,
 * kanal (şifreli token ile) kaydedilir. Dönüş: kanal id'si.
 */
export class ConnectClinicTelegramBotChannelCommand {
  readonly __responseType!: string;
  constructor(
    public readonly clinicId: string,
    public readonly input: ConnectClinicTelegramBotChannelInput,
    public readonly ctx: IGetContext
  ) {}
}
