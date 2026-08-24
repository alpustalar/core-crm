/**
 * Bir kullanıcının etkin yetkisi ve nereden geldiği. Yönetim ekranı "bunu
 * kaldırabilir miyim" sorusunu `source` alanına bakarak yanıtlar: rolden gelen
 * yetki bu ekrandan kaldırılamaz, rol değiştirilerek kaldırılır.
 */
export interface EffectiveCapability {
  capability: string;
  module: string;
  action: string;
  source: 'ROLE' | 'GRANT';
  grantedAt: Date | null;
  grantedById: string | null;
  reason: string | null;
}
