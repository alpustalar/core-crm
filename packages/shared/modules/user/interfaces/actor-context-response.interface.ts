/**
 * Giriş yapmış aktörün yetki sınırları — `GET /api/v1/me/context`.
 *
 * Backend her istekte bu bağlamı Firebase token'ından yeniden kurar; burada
 * dönen kopya frontend'in **yansıtma** amaçlıdır (menü gizleme, buton kapatma).
 * Yetkinin otoritesi her zaman backend guard'larıdır — bu listeye bakarak
 * verilen bir karar güvenlik değil, yalnız UX'tir.
 *
 * `source` ve `ip` bilinçli olarak dışarıda: ikisi de istek-kapsamlı, aktörün
 * kimliğine ait değil (`source` zaten frontend'in kendi gönderdiği başlık).
 */
export interface ActorContextResponse {
  userId: string;
  email: string;

  /** `modül:aksiyon` biçiminde yetkinlik anahtarları (ör. `lead:create`). */
  capabilities: string[];

  /** 100 ve üstü tüm yetkinlik kontrollerini atlar (bkz. `CapabilityGuard`). */
  rolePriority: number;

  roleId?: string;
  clinicId?: string;
  organizationId?: string;

  /** Klinik değiştiricinin listesi — yalnız kimlikler; adlar klinik modülünden çekilir. */
  managedClinics: string[];
  ownedOrganizations: string[];

  /** Aktör aynı zamanda bir sağlayıcıysa (doktor) profil kimliği. */
  providerId?: string;
}
