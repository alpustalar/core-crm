// WhatsApp Cloud API webhook payload tipleri (yalnızca kullanılan alanlar).
// https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples

/** Medya mesajı gövdesi (image/document/audio/video/sticker ortak alanları). */
export interface WhatsappMediaObject {
  id: string; // Meta media id (Graph API ile indirilir)
  mime_type?: string;
  sha256?: string;
  caption?: string;
  filename?: string;
}

/** interactive yanıt (buton/liste). */
export interface WhatsappInteractive {
  type?: 'button_reply' | 'list_reply' | string;
  button_reply?: { id: string; title?: string };
  list_reply?: { id: string; title?: string; description?: string };
}

export interface WhatsappLocation {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

/** bir mesaja verilen emoji reaksiyon (emoji boşsa reaksiyon kaldırılmış). */
export interface WhatsappReaction {
  message_id: string; // reaksiyon verilen mesajın wamid'i
  emoji?: string;
}

/** alıntı/yanıt bağlamı — quote edilen mesajın wamid'i. */
export interface WhatsappContext {
  id?: string;
  from?: string;
}

/**
 * Click-to-WhatsApp reklam referral'ı — kişi "Mesaj Gönder" reklamına tıklayınca ilk gelen
 * mesaja iliştirilir. `source_type: 'ad'` reklamdan geldiğini, `source_id` reklam id'sini,
 * `ctwa_clid` tıklama id'sini (Conversions API için) taşır.
 * https://developers.facebook.com/docs/whatsapp/cloud-api/guides/track-your-ads
 */
export interface WhatsappReferral {
  source_type?: string; // 'ad' | 'post'
  source_id?: string; // reklam (ad) id'si
  source_url?: string;
  headline?: string;
  body?: string;
  media_type?: string;
  image_url?: string;
  video_url?: string;
  ctwa_clid?: string; // Click-to-WhatsApp click id
}

export interface WhatsappInboundMessage {
  from: string; // gönderenin telefon numarası (wa_id)
  id: string; // WhatsApp mesaj id'si
  timestamp?: string; // unix saniye (string)
  type: string; // 'text' | 'image' | 'interactive' | 'location' | 'reaction' | ...
  text?: { body: string };
  image?: WhatsappMediaObject;
  document?: WhatsappMediaObject;
  audio?: WhatsappMediaObject;
  video?: WhatsappMediaObject;
  sticker?: WhatsappMediaObject;
  interactive?: WhatsappInteractive;
  location?: WhatsappLocation;
  reaction?: WhatsappReaction;
  contacts?: unknown[];
  context?: WhatsappContext;
  referral?: WhatsappReferral; // reklamdan (Click-to-WhatsApp) geldiyse dolu
}

export interface WhatsappStatus {
  id: string; // ilgili giden mesajın id'si
  status: string; // 'sent' | 'delivered' | 'read' | 'failed'
  timestamp?: string;
  recipient_id?: string;
  errors?: Array<{ code?: number; title?: string }>;
  pricing?: {
    billable?: boolean;
    pricing_model?: string;
    category?: string; // marketing | utility | authentication | service
  };
  conversation?: {
    id?: string;
    origin?: { type?: string };
    expiration_timestamp?: string; // unix saniye (string)
  };
}

export interface WhatsappContact {
  wa_id?: string;
  profile?: { name?: string };
}

export interface WhatsappValue {
  messaging_product?: string;
  metadata?: {
    display_phone_number?: string;
    phone_number_id?: string;
  };
  contacts?: WhatsappContact[];
  messages?: WhatsappInboundMessage[];
  statuses?: WhatsappStatus[];
}

/** `phone_number_quality_update` olayının value gövdesi. */
export interface WhatsappQualityValue {
  display_phone_number?: string;
  event?: string; // FLAGGED | UNFLAGGED | ONBOARDING
  current_limit?: string; // ör. TIER_1K
}

export interface WhatsappWebhookChange {
  field: string; // 'messages' | 'phone_number_quality_update' | ...
  value: WhatsappValue;
}

export interface WhatsappWebhookEntry {
  id: string;
  changes: WhatsappWebhookChange[];
}

export interface WhatsappWebhookBody {
  object: string; // 'whatsapp_business_account'
  entry: WhatsappWebhookEntry[];
}
