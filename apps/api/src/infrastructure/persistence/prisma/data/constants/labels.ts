export const MODULE_LABELS = {
  organization: 'Organizasyon',
  clinic: 'Klinik',
  clinicexception: '',
  clinicavailability: '',
  user: 'Kullanıcı',
  role: 'Rol',
  rolecapability: 'Rol Yetkisi',
  capability: 'Yetki',
  appointment: 'Randevu',
  treatment: 'Tedavi',
  patient: 'Hasta',
  mastertreatment: 'Ana Tedavi',
  medicalfile: 'Medikal Dosya',
  provider: 'Hizmet Veren',
  providerspecialty: 'Hizmet Veren Uzmanlığı',
  providertreatment: 'Hizmet Veren Tedavi',
  treatmentcategorytranslation: 'Tedavi Kategorisi Dil Çevirisi',
  providertitletranslation: 'Hizmet Veren Unvanı Dil Çevirisi',
  providerspecialtytranslation: 'Hizmet Veren Uzmanlığı Dil Çevirisi',
  treatmentcategory: 'Tedavi Kategorisi',
  treatmenttranslation: 'Tedavi Dil Çevirisi',
  providertitle: 'Hizmet Veren Unvanı',
  language: 'Dil',
  auditlog: 'Log',
  provideravailability: 'Hizmet Veren Müsaitliği',
  providerexception: '',
  providershift: 'Hizmet Veren Çalışma Saatleri (Shift)',
  sector: 'Sektör',
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
