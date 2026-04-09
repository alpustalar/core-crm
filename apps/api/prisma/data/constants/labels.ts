export const MODULE_LABELS = {
  organization: 'Organizasyon',
  clinic: 'Klinik',
  user: 'Kullanıcı',
  role: 'Rol',
  rolecapability: 'Rol Yetkisi',
  capability: 'Yetki',
  doctor: 'Doktor',
  doctortreatment: 'Doktor Tedavisi',
  doctoravailability: 'Doktor Uygunluk',
  appointment: 'Randevu',
  treatment: 'Tedavi',
  patient: 'Hasta',
  mastertreatment: 'Ana Tedavi',
  medicalfile: 'Medikal Dosya',
} as const;

export type ModuleLabel = (typeof MODULE_LABELS)[keyof typeof MODULE_LABELS];

export const CRUD_ACTION_LABELS = {
  create: 'Oluştur',
  read: 'Görüntüle',
  update: 'Güncelle',
  delete: 'Sil',
} as const;

export type ActionLabel =
  (typeof CRUD_ACTION_LABELS)[keyof typeof CRUD_ACTION_LABELS];
