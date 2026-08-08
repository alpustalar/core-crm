export const PLATFORM_TENANT_PROVIDER = Symbol('IPlatformTenantProvider');

/** Platformun kendi defterinin sahibi. */
export interface PlatformLedgerTarget {
  clinicId: string;
  organizationId: string;
}

export interface IPlatformTenantProvider {
  /**
   * Platform kiracısını çözer ve defterinin (hesap planının) kurulu olduğunu
   * garanti eder. Kiracı yoksa `PlatformTenantNotConfiguredException` fırlatır.
   */
  resolve(): Promise<PlatformLedgerTarget>;
}
