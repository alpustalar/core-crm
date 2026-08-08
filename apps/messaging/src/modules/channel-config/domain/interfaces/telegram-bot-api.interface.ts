export const TELEGRAM_BOT_API = Symbol('ITelegramBotApi');

/** getMe sonucu — bot token doğrulaması + kimlik. */
export interface TelegramBotIdentity {
  id: number;
  username: string | null;
  firstName: string;
}

/** Telegram'a gönderim için medya alt-tipi (Bot API metodu seçimini belirler). */
export type TelegramSendMediaKind = 'photo' | 'document' | 'video' | 'audio';

/**
 * Telegram Bot API (HTTPS) çağrıları — klinik başına bot token'ı ile. Token doğrulama +
 * webhook kurulumu (onboarding) ve mesaj gönderimi (adapter) için kullanılır. Stateless:
 * her çağrı ilgili kliniğin token'ını alır (Telegraf instance önbelleği tutulmaz).
 */
export interface ITelegramBotApi {
  /** Token geçerliliğini doğrular ve bot kimliğini döner (geçersizse hata fırlatır). */
  getMe(botToken: string): Promise<TelegramBotIdentity>;
  /** Klinik bazlı webhook URL'ini secret_token ile kurar. */
  setWebhook(botToken: string, url: string, secretToken: string): Promise<void>;
  /** Webhook'u kaldırır (disconnect). En iyi-çaba; hata yutulur. */
  deleteWebhook(botToken: string): Promise<void>;
  /** Düz metin mesaj gönderir; Telegram mesaj id'sini döner. */
  sendMessage(
    botToken: string,
    chatId: string,
    text: string
  ): Promise<{ messageId: string }>;
  /**
   * Kullanıcıdan telefonunu paylaşmasını ister: tek-kullanımlık `request_contact` reply
   * klavyesi gönderir. Kullanıcı dokununca Telegram bir `contact` mesajı (doğrulanmış
   * telefon) iletir → hasta eşlemesi yapılır. Yalnız özel sohbette çalışır.
   */
  sendContactRequest(
    botToken: string,
    chatId: string,
    text: string,
    buttonText: string
  ): Promise<void>;
  /** Medya (foto/dosya/video/ses) gönderir (link ile); Telegram mesaj id'sini döner. */
  sendMedia(input: {
    botToken: string;
    chatId: string;
    kind: TelegramSendMediaKind;
    fileUrl: string;
    caption?: string | null;
  }): Promise<{ messageId: string }>;
}
