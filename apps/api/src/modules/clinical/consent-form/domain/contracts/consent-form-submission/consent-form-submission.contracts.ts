import { Pagination } from '@shared/common';

/**
 * signatureImage boş-değil kuralı burada değil; `@shared` HTTP sınırı DTO'sunda
 * (SignConsentFormSchema, packages/shared/modules/consent-form/schemas/commands)
 * zaten `.min(1)` ile enforce ediliyor — domain katmanı ikinci kez doğrulamaz.
 */
export interface SignConsentFormProps {
  id?: string;
  organizationId: string;
  clinicId: string;
  patientId: string;
  templateId: string;
  templateVersion: number;
  templateTitleSnapshot: string;
  templateContentSnapshot: string;
  signatureImage: string;
  signedByUserId: string;
  appointmentId?: string | null;
  treatmentId?: string | null;
}

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

export interface FindConsentSubmissionsByPatientFilter {
  patientId: string;
  pagination: Pagination;
}
