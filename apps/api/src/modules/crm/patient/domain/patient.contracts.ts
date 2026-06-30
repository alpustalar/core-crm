import { z } from 'zod';
import { Decimal } from 'decimal.js';
import BloodTypeSchema from '@input-type-schemas/BloodTypeSchema';
import { GenderSchema, PatientTypeSchema } from '@shared';

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
  discountRate: z.instanceof(Decimal).nullable().optional(),
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
