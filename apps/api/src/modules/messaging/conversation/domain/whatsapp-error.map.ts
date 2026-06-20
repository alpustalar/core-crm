/**
 * WhatsApp Cloud API gönderim hata kodlarını okunabilir (TR) nedene ve retry edilebilir
 * olup olmadığına eşler. Webhook `statuses[].errors[].code` ile gelen kod buradan
 * çözümlenir; bilinmeyen kodlar için ham başlık korunur.
 * https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes
 */
export interface WhatsappErrorInfo {
  /** Okunabilir Türkçe açıklama. */
  reason: string;
  /** Hata geçici mi (kuyruk retry'ı anlamlı mı)? */
  retriable: boolean;
}

const ERROR_MAP: Record<number, WhatsappErrorInfo> = {
  131047: {
    reason:
      '24 saatlik müşteri hizmetleri penceresi kapalı — serbest mesaj gönderilemez (yalnızca onaylı şablon).',
    retriable: false,
  },
  131026: { reason: 'Mesaj iletilemedi (alıcı uygun değil).', retriable: false },
  131051: { reason: 'Desteklenmeyen mesaj tipi.', retriable: false },
  131052: { reason: 'Medya indirilemedi.', retriable: false },
  131053: { reason: 'Medya yüklenemedi.', retriable: false },
  131000: { reason: 'Beklenmeyen bir hata oluştu.', retriable: true },
  130429: {
    reason: 'Gönderim hız limiti aşıldı (rate limit).',
    retriable: true,
  },
  131056: {
    reason: 'Bu numara çiftine gönderim hız limiti aşıldı.',
    retriable: true,
  },
  132000: {
    reason: 'Şablon parametre sayısı uyuşmuyor.',
    retriable: false,
  },
  132001: {
    reason: 'Şablon bulunamadı veya onaylı değil.',
    retriable: false,
  },
  132005: { reason: 'Şablon metni çok uzun.', retriable: false },
  132007: {
    reason: 'Şablon içeriği politika ihlali (karakter politikası).',
    retriable: false,
  },
  132012: {
    reason: 'Şablon parametre formatı uyuşmuyor.',
    retriable: false,
  },
  132015: { reason: 'Şablon duraklatıldı (paused).', retriable: false },
  132016: { reason: 'Şablon devre dışı bırakıldı.', retriable: false },
  133010: {
    reason: 'Numara Cloud API’ye register edilmemiş.',
    retriable: false,
  },
  190: {
    reason: 'Erişim token’ı geçersiz/süresi dolmuş — yeniden bağlanın.',
    retriable: false,
  },
  368: {
    reason: 'Numara politika ihlali nedeniyle geçici olarak bloklandı.',
    retriable: false,
  },
  100: { reason: 'Geçersiz istek parametresi.', retriable: false },
};

/** Kod + ham başlık → çözümlenmiş hata bilgisi. Bilinmeyen kodda ham başlık kullanılır. */
export function resolveWhatsappError(
  code: number | null | undefined,
  fallbackTitle?: string | null
): WhatsappErrorInfo {
  if (code != null && ERROR_MAP[code]) return ERROR_MAP[code];
  return {
    reason: fallbackTitle ?? 'Bilinmeyen gönderim hatası.',
    retriable: false,
  };
}
