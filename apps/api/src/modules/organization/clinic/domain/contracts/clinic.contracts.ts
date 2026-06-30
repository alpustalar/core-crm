import { z } from 'zod';
import {
  Clinic,
  CreateClinic,
  Organization,
  TimeZoneSchema,
  UpdateClinic,
} from '@shared';
import { GlobalStatusSchema } from '@input-type-schemas/GlobalStatusSchema';

// ==========================================
// 1. KLİNİK DETAY VE METRİK SÖZLEŞMELERİ (DETAILS)
// ==========================================

// Ortak paylaşılan kütüphanelerdeki tipler için esnek taban şemalar:
const SharedClinicSchema = z.custom<Clinic>(
  (val) => val !== null && typeof val === 'object'
);
const SharedOrganizationSchema = z.custom<Organization>(
  (val) => val !== null && typeof val === 'object'
);

export const ClinicDetailsSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  sectorId: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  district: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  consultationSlotDuration: z.number().int().positive(),
  status: GlobalStatusSchema,
  timezone: z.string(),
  logo: z.string().nullable(),
  organizationId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),

  organization: z.custom<Organization>().nullable(),

  managers: z.array(
    z.object({
      id: z.uuid(),
      displayName: z.string().min(1),
      email: z.string().email(),
    })
  ),

  // Prisma aggregation sayaçları:
  _count: z.object({
    providers: z.number().int().nonnegative(),
    patients: z.number().int().nonnegative(),
    appointments: z.number().int().nonnegative(),
  }),
});

export type ClinicDetails = z.infer<typeof ClinicDetailsSchema>;

// ==========================================
// 2. ŞUBE OLUŞTURMA VE İLİŞKİ SÖZLEŞMELERİ (PROPS & RELATIONS)
// ==========================================

const SharedCreateClinicSchema = z.custom<CreateClinic>(
  (val) => val !== null && typeof val === 'object'
);

export const CreateClinicPropsSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1, 'Klinik adı boş olamaz'),
  sectorId: z.uuid(),
  phone: z.string().nullable().optional(),
  email: z.email('Geçersiz e-posta formatı').nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  consultationSlotDuration: z.number().int().positive(),
  status: GlobalStatusSchema.optional(),
  timezone: TimeZoneSchema,
  logo: z.url().optional().nullable(),
  organizationId: z.uuid().optional(),
});

export type CreateClinicProps = z.infer<typeof CreateClinicPropsSchema>;

export const CreateClinicInternalRelationsSchema = z.object({
  organizationId: z.uuid(),
  clinicId: z.uuid(),
});
export type CreateClinicInternalRelations = z.infer<
  typeof CreateClinicInternalRelationsSchema
>;

// ==========================================
// 3. YÖNETİCİ GÜNCELLEME SÖZLEŞMELERİ (PROPS)
// ==========================================

const SharedUpdateClinicSchema = z.custom<UpdateClinic>(
  (val) => val !== null && typeof val === 'object'
);

export const UpdateAsManagerPropsSchema = z.object({
  id: z.uuid(), // Güncellenecek klinik ID
  userId: z.uuid(), // İşlemi yapan yönetici ID
  data: SharedUpdateClinicSchema,
});
export type UpdateAsManagerProps = z.infer<typeof UpdateAsManagerPropsSchema>;
