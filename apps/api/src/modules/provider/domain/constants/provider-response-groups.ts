export const UserResponseGroups = {
  DATA_OWNER: 'DATA_OWNER', // Verinin sahibi (Kullanıcının kendisi)
  INTERNAL: 'INTERNAL', // Aynı klinik/organizasyon içi erişim
  ADMIN: 'ADMIN',
} as const;

export type UserResponseGroupsType =
  (typeof UserResponseGroups)[keyof typeof UserResponseGroups];
