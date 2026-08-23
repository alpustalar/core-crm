import { z } from 'zod';
import BloodTypeSchema from '@input-type-schemas/BloodTypeSchema';
import { GenderSchema, PatientTypeSchema } from '@shared';
import { ResponseGroups } from '@common/constants/response-groups.constant';
import { PatientStatusSchema } from '@input-type-schemas/PatientStatusSchema';

// ==========================================
// HASTA SERİLEŞTİRME GRUPLARI (RESPONSE GROUPS)
// ==========================================
// Staff tarafındaki hasta cevaplarının alan görünürlüğünü belirler.
// MEDICAL, hasta kaydının tıbbi bağlamını (kan grubu, checkup, klinik notlar)
// yalnızca klinik/tıbbi personele açmak için genel gruplara eklenir.
export const PatientResponseGroups = {
  ...ResponseGroups,
  MEDICAL: 'MEDICAL',
} as const;

export type PatientResponseGroup =
  (typeof PatientResponseGroups)[keyof typeof PatientResponseGroups];

// ==========================================
// HASTA OLUŞTURMA SÖZLEŞMESİ (PROPS)
// ==========================================

export const CreatePatientPropsSchema = z.object({
  id: z.uuid().optional(),
  firebaseUid: z.string().optional(),
  organizationId: z.uuid('Kurum ID zorunludur'),

  // İletişim ve İsim bilgileri (Zorunlu)
  phone: z
    .string()
    .min(10, 'Geçerli bir telefon numarası giriniz')
    .optional()
    .nullable(),
  firstName: z.string().min(1, 'Hasta adı zorunludur'),

  // Opsiyonel alanlar
  clinicId: z.uuid().nullable().optional(),
  sectorId: z.uuid().nullable().optional(),
  lastName: z.string().nullable().optional(),
  tcNo: z.string().length(11, 'TCKN 11 haneli olmalıdır').nullable().optional(),
  birthDate: z.date().nullable().optional(),
  gender: GenderSchema.nullable().optional(),

  // Ek İletişim
  alternativePhone: z.string().nullable().optional(),
  email: z.email('Geçersiz e-posta formatı').nullable().optional(),
  address: z.string().nullable().optional(),

  // Acil Durum ve Refakatçi
  emergencyContact: z.string().nullable().optional(),
  companionName: z.string().nullable().optional(),
  companionPhone: z.string().nullable().optional(),

  // Tıbbi ve Operasyonel Bilgiler
  profilePhoto: z.url().nullable().optional(),
  protocolNo: z.string().nullable().optional(),
  allergies: z.string().nullable().optional(),
  chronicDiseases: z.string().nullable().optional(),
  bloodType: BloodTypeSchema.nullable().optional(),
  patientType: PatientTypeSchema.nullable().optional(),

  // Hekim ve Finansal İlişkiler
  responsibleProviderId: z.uuid().nullable().optional(),
  checkupDate: z.date().nullable().optional(),
});

export type CreatePatientProps = z.infer<typeof CreatePatientPropsSchema>;

export const FindPatientByContactFilterSchema = z
  .object({
    organizationId: z.uuid().optional(),

    phone: z
      .string()
      .min(10, 'Telefon numarası en az 10 karakter olmalıdır')
      .nullable()
      .optional(),
    email: z.email('Geçersiz e-posta formatı').nullable().optional(),
  })
  .refine((data) => data.phone || data.email, {
    message: 'Arama yapmak için en az telefon veya e-posta bilgisi gereklidir',
    path: ['phone'],
  });

export type FindPatientByContactFilter = z.infer<
  typeof FindPatientByContactFilterSchema
>;

/**
 * Hasta listeleme filtresi. Kapsam organizasyondur (hasta organizasyona ait,
 * klinik opsiyonel); `clinicId` verilirse yalnız o şubenin hastalarına daralır.
 * Ad/telefon/protokol araması `pagination.search` üzerinden yürür — `paginate`
 * helper'ı tek kolonda arar, çok kolonlu arama repo'da açıkça kurulur.
 */
export const FindPatientsFilterSchema = z.object({
  organizationId: z.uuid(),
  clinicId: z.uuid().nullable().optional(),
  status: PatientStatusSchema.optional(),
  /** Ad, soyad, telefon veya protokol numarasında geçen metin. */
  search: z.string().min(1).optional(),
});

export type FindPatientsFilter = z.infer<typeof FindPatientsFilterSchema>;
