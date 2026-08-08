/**
 * Telegram Bot API webhook (Update) gövdesinin yalnızca kullandığımız alt kümesi.
 * Tam şema: https://core.telegram.org/bots/api#update
 */

export interface TelegramWebhookUser {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface TelegramWebhookChat {
  id: number;
  type?: string;
}

/** Kullanıcının request_contact ile paylaştığı kişi (doğrulanmış telefon). */
export interface TelegramWebhookContact {
  phone_number: string;
  user_id?: number;
  first_name?: string;
  last_name?: string;
}

export interface TelegramWebhookMessage {
  message_id: number;
  from?: TelegramWebhookUser;
  chat: TelegramWebhookChat;
  date?: number;
  text?: string;
  caption?: string;
  contact?: TelegramWebhookContact;
}

export interface TelegramWebhookUpdate {
  update_id: number;
  message?: TelegramWebhookMessage;
  edited_message?: TelegramWebhookMessage;
}
