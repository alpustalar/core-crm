import { z } from 'zod';
import { ClinicLegalTypeSchema } from '@input-type-schemas/ClinicLegalTypeSchema';

// ==========================================
// 1. RESMİ SPESİFİKASYON OLUŞTURMA SÖZLEŞMELERİ (PROPS)
// ==========================================

export const CreateClinicGovernmentSpecsPropsSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(), // Şube ilişkisi için katı UUID kilidi

  // T.C. Sağlık Bakanlığı ÇKYS / Tesis Kodu doğrulaması
  healthFacilityCode: z.string().min(1, 'Sağlık tesisi kodu zorunludur'),

  ussPassword: z.string().nullable().optional(), // USS entegrasyon şifresi
  companyTaxNumber: z.string().nullable().optional(), // Şirket VKN (Vergi Kimlik Numarası)
  legalType: ClinicLegalTypeSchema.optional(), // Örn: ŞAHIS, LİMİTED, ANONİM
});

export type CreateClinicGovernmentSpecsProps = z.infer<
  typeof CreateClinicGovernmentSpecsPropsSchema
>;

// ==========================================
// 2. RESMİ SPESİFİKASYON GÜNCELLEME SÖZLEŞMELERİ (PROPS)
// ==========================================

export const UpdateClinicGovernmentSpecsPropsSchema = z.object({
  // Güncelleme esnasında tüm alanlar opsiyoneldir (Sadece gelen alanlar güncellenir)
  healthFacilityCode: z
    .string()
    .min(1, 'Sağlık tesisi kodu boş bırakılamaz')
    .optional(),
  ussPassword: z.string().nullable().optional(),
  companyTaxNumber: z.string().nullable().optional(),
  legalType: ClinicLegalTypeSchema.optional(),
});

export type UpdateClinicGovernmentSpecsProps = z.infer<
  typeof UpdateClinicGovernmentSpecsPropsSchema
>;
