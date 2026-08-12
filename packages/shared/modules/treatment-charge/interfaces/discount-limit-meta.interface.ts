/**
 * `TREATMENT_CHARGE.DISCOUNT_LIMIT_EXCEEDED` hatasının payload'ı.
 *
 * Frontend bu bilgiyle "izin verilen orana çek" ya da "yönetici onayı iste"
 * akışını kurabilir; kullanıcıya çıplak bir 403 göstermek zorunda kalmaz.
 */
export interface DiscountLimitMeta {
  /** Kullanıcının vermek istediği indirim yüzdesi */
  requestedRate: number;
  /** Klinik ayarındaki tavan (ClinicFinanceSettings.maxDiscountPercent) */
  maxAllowedRate: number;
  /** Tavanı aşabilecek rol var mı — yönetici onayı istemek anlamlı mı? */
  overridableByManager: boolean;
}
