import type { LeadSource } from './lead.types';

/**
 * Etiketler tek yerde: hem filtre açılırı hem oluşturma formu hem tablo
 * hücresi buradan okur. Enum'un kendisi üretilmiş şemadan gelir, bu yüzden yeni
 * bir kaynak eklendiğinde TypeScript burayı eksik bırakmaya izin vermez
 * (`Record<LeadSource, string>`).
 */
export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  WHATSAPP: 'WhatsApp',
  INSTAGRAM: 'Instagram',
  MESSENGER: 'Messenger',
  TELEGRAM: 'Telegram',
  META_FORM: 'Meta formu',
  GOOGLE_ADS: 'Google Ads',
  WEBSITE: 'Web sitesi',
  MANUAL: 'Manuel',
};
