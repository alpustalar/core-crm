/**
 * Kiracı kapsamı (tenant scope) çözümleme sözleşmesi.
 *
 * Framework-agnostik tutulur: hem apps/api hem başka servisler (apps/messaging vb.)
 * aynı sözleşmeyi import eder, her servis kendi adapter'ını kaydeder.
 */

/** Çözümleme girdisi — clinicId zorunlu, organizationId opsiyonel (DTO'dan gelir). */
export interface TenantScopeInput {
  readonly clinicId: string;
  readonly organizationId?: string | null;
}

export interface ITenantScopeResolver {
  /**
   * Kaydın bağlanacağı organizasyonun id'sini döner.
   * Girdideki organizationId doluysa onu kullanır, boşsa clinicId'den çözer.
   */
  resolve(input: TenantScopeInput): Promise<string>;
}
