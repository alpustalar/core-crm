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
  /** Reklam referral'ı ilk mesajda `message.referral` içinde de gelebilir. */
  referral?: InstagramWebhookReferral;
}

/**
 * Instagram/Messenger reklam referral'ı — kişi reklama tıklayıp DM'e düştüğünde gelir.
 * `source: 'ADS'` reklamdan geldiğini, `ad_id` reklam id'sini taşır.
 * https://developers.facebook.com/docs/messenger-platform/instagram/features/webhook
 */
export interface InstagramWebhookReferral {
  ref?: string;
  ad_id?: string;
  source?: string; // 'ADS' | 'SHORTLINK' | ...
  type?: string; // 'OPEN_THREAD' | ...
}

export interface InstagramWebhookMessaging {
  sender?: { id: string };
  recipient?: { id: string };
  timestamp?: number;
  message?: InstagramWebhookMessage;
  /** Reklam referral'ı messaging seviyesinde de gelebilir (thread ilk açılışı). */
  referral?: InstagramWebhookReferral;
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
