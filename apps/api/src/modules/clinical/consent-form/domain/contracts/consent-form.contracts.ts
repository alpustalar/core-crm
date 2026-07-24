import { z } from 'zod';
import { Pagination } from '@shared/common';

// ==========================================
// CONSENT FORM TEMPLATE — oluşturma/güncelleme
// organizationId bağlamdan (actor/klinik) gelir — DTO'da yer almaz.
// ==========================================

export const CreateConsentTemplateSchema = z.object({
  id: z.uuid().optional(),
  organizationId: z.uuid(),
  clinicId: z.uuid(),
  sectorId: z.uuid().nullable().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  createdByUserId: z.string(),
});
export type CreateConsentTemplateProps = z.infer<
  typeof CreateConsentTemplateSchema
>;

export const UpdateConsentTemplateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  sectorId: z.uuid().nullable().optional(),
  updatedByUserId: z.string(),
});
export type UpdateConsentTemplateProps = z.infer<
  typeof UpdateConsentTemplateSchema
>;

// ==========================================
// CONSENT FORM SUBMISSION — tablet imzası
// ==========================================

export const SignConsentFormSchema = z.object({
  id: z.uuid().optional(),
  organizationId: z.uuid(),
  clinicId: z.uuid(),
  patientId: z.uuid(),
  templateId: z.uuid(),
  templateVersion: z.number().int().positive(),
  templateTitleSnapshot: z.string().min(1),
  templateContentSnapshot: z.string().min(1),
  signatureImage: z.string().min(1),
  signedByUserId: z.string(),
  appointmentId: z.uuid().nullable().optional(),
  treatmentId: z.uuid().nullable().optional(),
});
export type SignConsentFormProps = z.infer<typeof SignConsentFormSchema>;

// ==========================================
// Read-model'ler
// ==========================================

/** Hasta imza listesinde taşınan hafif projeksiyon — tam snapshot metni/imza görüntüsü içermez. */
export interface ConsentFormSubmissionListItem {
  id: string;
  templateId: string;
  templateTitleSnapshot: string;
  templateVersion: number;
  signedAt: Date;
  signedByUserId: string;
  appointmentId: string | null;
  treatmentId: string | null;
}

export const FindConsentTemplatesFilterSchema = z.object({
  clinicId: z.uuid(),
  isActive: z.coerce.boolean().optional(),
  sectorId: z.uuid().optional(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});
export type FindConsentTemplatesFilter = z.infer<
  typeof FindConsentTemplatesFilterSchema
>;

export const FindConsentSubmissionsByPatientFilterSchema = z.object({
  patientId: z.uuid(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});
export type FindConsentSubmissionsByPatientFilter = z.infer<
  typeof FindConsentSubmissionsByPatientFilterSchema
>;
