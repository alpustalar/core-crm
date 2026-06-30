export const ResponseGroups = {
  DATA_OWNER: 'DATA_OWNER', // Verinin sahibi (Kullanıcının kendisi)
  INTERNAL: 'INTERNAL', // Aynı klinik/organizasyon içi erişim
  MANAGEMENT: 'MGMT',
  FINANCIAL: 'FINANCIAL', // Muhasebe/Finans verileri
  ADMIN: 'ADMIN',
} as const;

export type ResponseGroup =
  (typeof ResponseGroups)[keyof typeof ResponseGroups];
