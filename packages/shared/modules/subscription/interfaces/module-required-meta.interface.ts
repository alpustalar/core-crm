/**
 * `SubscriptionModuleRequiredException` payload'ı — hem backend exception'ı hem frontend tüketir.
 * Kiracının aboneliğinde gerekli modül yoksa fırlatılır; frontend "Modül ekle / Plan yükselt"
 * akışını bu bilgiyle açar.
 */
export interface SubscriptionModuleRequiredMeta {
  /** Erişim için gereken modül anahtarı (ör. "e_invoice"). */
  requiredModule: string;
  /** Kiracının o anki planı (null = abonelik yok / süresi bitmiş). */
  currentPlanId: string | null;
}
