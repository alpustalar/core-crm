/**
 * Bir kiracının (org/klinik) abonelik yetkileri (entitlement) — RBAC capability'den ayrı 2. kapı.
 * `GetTenantEntitlementsQuery` üretir, Redis'te tenant-anahtarlı cache'lenir, `ModuleEntitlementGuard`
 * tüketir. Tarihler cache JSON round-trip'i için ISO string.
 */
export interface TenantEntitlements {
  /** Erişilebilir modül anahtarları (plan bundle ∪ eklenti modüller). */
  modules: string[];
  /** Aktif plan (deneme sürümünde 'FREE_TRIAL'); abonelik yoksa null. */
  planId: string | null;
  /** Abonelik durumu (ACTIVE | PAST_DUE | CANCELED | EXPIRED); yoksa null. */
  status: string | null;
  /** Erişim açık mı — aktif / geçerli deneme / grace içinde ise true. */
  active: boolean;
  /** Deneme bitişi (ISO) — null ise deneme değil. */
  trialEndsAt: string | null;
}
