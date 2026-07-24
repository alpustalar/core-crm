import { z } from 'zod';

/////////////////////////////////////////
// CONSENT FORM SUBMISSION SCHEMA
/////////////////////////////////////////

/**
 * Hastanın tablette imzaladığı onam formu kaydı. Şablon sonradan değişse bile hastanın
 * imzaladığı METİN (templateTitleSnapshot/templateContentSnapshot) burada donmuş kalır.
 * Immutable — düzeltme gerekirse yeni bir kayıt açılır, mevcut kayıt değiştirilmez.
 */
export const ConsentFormSubmissionSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  clinicId: z.string(),
  patientId: z.string(),
  templateId: z.string(),
  templateVersion: z.number().int(),
  templateTitleSnapshot: z.string(),
  templateContentSnapshot: z.string(),
  signatureImage: z.string(),
  signedAt: z.coerce.date(),
  signedByUserId: z.string(),
  appointmentId: z.string().nullable(),
  treatmentId: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type ConsentFormSubmission = z.infer<typeof ConsentFormSubmissionSchema>

export default ConsentFormSubmissionSchema;
