// domain/contracts/user.contracts.ts
import { z } from 'zod';
import { GlobalStatusSchema } from '@input-type-schemas/GlobalStatusSchema';
import { RoleWithCapabilities } from '@common/interfaces';
import { PaginationSchema } from '@shared';
import { MapPaginationResult } from '@src/infrastructure/persistence/prisma/base.repository';

// ==========================================
// 1. SORGULAMA VE PASAPORT SÖZLEŞMELERİ (RESPONSES & DATA)
// ==========================================

// Ortak arabirimlerdeki RoleWithCapabilities için esnek ama kontrollü zırh:
const RoleWithCapabilitiesSchema = z.custom<RoleWithCapabilities>(
  (val) => val !== null && typeof val === 'object'
);

export const AuthUserResponseSchema = z
  .object({
    id: z.uuid(),
    displayName: z.string().min(1),
    email: z.string().email('Geçersiz e-posta formatı'),
    emailVerified: z.boolean(),
    status: GlobalStatusSchema,

    roleId: z.uuid().nullable(),
    picture: z.string().nullable(),
    clinicId: z.uuid().nullable(),

    lastLogin: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),

    // İlişkisel dizi ve nesne haritalamaları:
    managedClinics: z.array(z.object({ id: z.uuid() })),
    ownedOrganizations: z.array(z.object({ id: z.uuid() })),
    providerProfile: z.object({ id: z.uuid() }).nullable(),
    role: RoleWithCapabilitiesSchema.nullable(),
  })
  .nullable();

export type AuthUserResponse = z.infer<typeof AuthUserResponseSchema>;

export const FindUsersByClinicIdsFilterSchema = z.object({
  pagination: PaginationSchema,
  clinicId: z.union([z.uuid(), z.array(z.uuid())]), // Tekil veya dizi halindeki şube ID'leri
});
export type FindUsersByClinicIdsFilter = z.infer<
  typeof FindUsersByClinicIdsFilterSchema
>;

export const FindUsersByOrganizationIdsFilterSchema = z.object({
  pagination: PaginationSchema,
  organizationId: z.union([z.uuid(), z.array(z.uuid())]),
});
export type FindUsersByOrganizationIdsFilter = z.infer<
  typeof FindUsersByOrganizationIdsFilterSchema
>;

// ==========================================
// 2. KULLANICI OLUŞTURMA SÖZLEŞMELERİ (PROPS & RELATIONS)
// ==========================================

export const CreateUserInternalRelationsSchema = z.object({
  ownedOrganizationIds: z.array(z.uuid()).optional(),
  managedClinicIds: z.array(z.uuid()).optional(),
});

export type CreateUserInternalRelations = z.infer<
  typeof CreateUserInternalRelationsSchema
>;

export const CreateUserPropsSchema = z.object({
  id: z.uuid(),
  email: z.email('Geçersiz e-posta formatı'),
  displayName: z.string().min(1, 'Görüntülenen isim boş olamaz'),
  picture: z.string().optional(),
  roleId: z.uuid(),
  clinicId: z.uuid().optional(),
  ownedOrganizationIds: z.array(z.uuid()).optional(),
  managedClinicIds: z.array(z.uuid()).optional(),
});
export type CreateUserProps = z.infer<typeof CreateUserPropsSchema>;

export const UpdateDetailsSchema = z.object({
  displayName: z.string().min(1, 'İsim boş olamaz').optional(),
  picture: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  status: GlobalStatusSchema.optional(),
  roleId: z.uuid().optional(),
  clinicId: z.uuid().nullable().optional(),
});
export type UpdateDetailsProps = z.infer<typeof UpdateDetailsSchema>;

// ==========================================
// KULLANICI ÖZET SÖZLEŞMELERİ (USER SUMMARY)
// ==========================================

export const UserSummarySchema = z.object({
  id: z.uuid(),
  displayName: z.string().min(1),
  email: z.string().email(),
  picture: z.string().nullable(),
  status: GlobalStatusSchema,
  lastLogin: z.date(),
  createdAt: z.date(),

  // İlişkisel alt nesneler (UUID zırhlı):
  role: z
    .object({
      id: z.uuid(),
      name: z.string(),
    })
    .nullable(),

  workingClinic: z
    .object({
      id: z.uuid(),
      name: z.string(),
    })
    .nullable(),

  providerProfile: z
    .object({
      id: z.uuid(),
    })
    .nullable(),

  managedClinics: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
    })
  ),
});

// 1. Aşama: Orijinal tipi doğrudan Zod şemasından infer ediyoruz (Uyuşmazlığı engeller)
export type UserSummary = z.infer<typeof UserSummarySchema>;

export type PaginatedUsers = MapPaginationResult<UserSummary>;

export const PaginatedUsersSchema = z.object({
  // Altyapı katmanındaki MapPaginationResult yapısının (data/items, meta vb.)
  // gerçek alan adlarına göre burayı esnetebilir veya doğrudan eşleştirebilirsin:
  items: z.array(UserSummarySchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
}) as z.ZodType<PaginatedUsers>;
