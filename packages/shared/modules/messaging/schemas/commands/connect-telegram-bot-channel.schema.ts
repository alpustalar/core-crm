import { z } from 'zod';

/**
 * Klinik kendi Telegram botunu (BotFather token) sisteme bağlar. Token doğrulanır
 * (getMe) ve klinik bazlı webhook gizli yol + secret_token ile kurulur.
 */
export const ConnectTelegramBotChannelSchema = z.object({
  /** BotFather'dan alınan bot token'ı (ör. "123456:ABC-DEF..."). */
  botToken: z.string().min(1),
});
