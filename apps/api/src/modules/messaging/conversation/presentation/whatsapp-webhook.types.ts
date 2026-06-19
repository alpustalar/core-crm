// WhatsApp Cloud API webhook payload tipleri (yalnızca kullanılan alanlar).
// https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples

export interface WhatsappInboundMessage {
  from: string; // gönderenin telefon numarası (wa_id)
  id: string; // WhatsApp mesaj id'si
  timestamp?: string; // unix saniye (string)
  type: string; // 'text' | 'image' | 'audio' | 'document' | ...
  text?: { body: string };
}

export interface WhatsappStatus {
  id: string; // ilgili giden mesajın id'si
  status: string; // 'sent' | 'delivered' | 'read' | 'failed'
  timestamp?: string;
  recipient_id?: string;
  errors?: Array<{ code?: number; title?: string }>;
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

export interface WhatsappWebhookChange {
  field: string; // 'messages'
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
