/**
 * Instagram (Messenger Platform) webhook gövdesinin yalnızca kullandığımız alt kümesi.
 * Tam şema: https://developers.facebook.com/docs/messenger-platform/instagram
 */

export interface InstagramWebhookAttachment {
  type?: string;
  payload?: { url?: string };
}

export interface InstagramWebhookMessage {
  mid: string;
  text?: string;
  /** İşletmenin kendi gönderdiği (echo) mesaj — gelen olarak işlenmez. */
  is_echo?: boolean;
  attachments?: InstagramWebhookAttachment[];
}

export interface InstagramWebhookMessaging {
  sender?: { id: string };
  recipient?: { id: string };
  timestamp?: number;
  message?: InstagramWebhookMessage;
}

export interface InstagramWebhookEntry {
  id: string; // IG professional account id (routing)
  time?: number;
  messaging?: InstagramWebhookMessaging[];
}

export interface InstagramWebhookBody {
  object?: string; // 'instagram'
  entry?: InstagramWebhookEntry[];
}
