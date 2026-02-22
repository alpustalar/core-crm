export const UserResponseGroups = {
  // 1. Sahiplik ve Yakınlık
  DATA_OWNER: 'DATA_OWNER', // Verinin sahibi (Kullanıcının kendisi)
  INTERNAL: 'INTERNAL', // Aynı klinik/organizasyon içi erişim

  // 2. Yönetimsel Seviyeler
  MANAGEMENT_BASIC: 'MGMT_1', // Şube sorumlusu (Status görebilir)
  MANAGEMENT_FULL: 'MGMT_2', // Klinik/Org sahibi (Finansal/Hassas detaylar)

  // 3. Güvenlik ve Sistem
  SENSITIVE: 'SENSITIVE', // Sadece Root Admin (Loglar, IP'ler)
  AUDIT: 'AUDIT', // Denetçi (Silinmiş veriler, değişim geçmişi)

  // 4. Modüler Kısıtlamalar
  FINANCIAL: 'FINANCIAL', // Muhasebe/Finans verileri
  MEDICAL: 'MEDICAL', // Hasta/Tıbbi kayıt erişimi
} as const;

export type UserResponseGroupsType =
  (typeof UserResponseGroups)[keyof typeof UserResponseGroups];
