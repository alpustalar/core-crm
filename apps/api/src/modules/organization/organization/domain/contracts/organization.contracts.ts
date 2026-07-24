import { z } from 'zod';
import { TimeZoneSchema } from '@shared';

// ==========================================
// 1. KURUM OLUŞTURMA SÖZLEŞMELERİ (PROPS)
// ==========================================

export const CreateOrganizationPropsSchema = z.object({
  id: z.uuid(), // 2026 Standartı: Katı iç sistem ID doğrulaması
  name: z.string().min(1, 'Kurum adı boş bırakılamaz'),
  phone: z.string().nullable().optional(),
  email: z.email('Geçersiz e-posta formatı').nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  timezone: TimeZoneSchema.optional(), // Boş gelirse iş mantığında varsayılan değer atanabilir
});
export type CreateOrganizationProps = z.infer<
  typeof CreateOrganizationPropsSchema
>;

export const CreateOrganizationInternalRelationsPropsSchema = z.object({
  id: z.uuid(),
});
export type CreateOrganizationInternalRelationsProps = z.infer<
  typeof CreateOrganizationInternalRelationsPropsSchema
>;

// ==========================================
// 2. KURUM GÜNCELLEME SÖZLEŞMELERİ (PROPS)
// ==========================================

export const UpdateOrganizationInfoPropsSchema = z.object({
  // Güncelleme esnasında tüm alanlar opsiyoneldir (Sadece gelen alanlar işlenir)
  name: z.string().min(1, 'Kurum adı boş bırakılamaz').optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email('Geçersiz e-posta formatı').nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
});
export type UpdateOrganizationInfoProps = z.infer<
  typeof UpdateOrganizationInfoPropsSchema
>;
