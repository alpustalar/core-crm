import { z } from 'zod';
import { FileTypeSchema } from '../inputTypeSchemas/FileTypeSchema'

/////////////////////////////////////////
// MEDICAL FILE SCHEMA
/////////////////////////////////////////

export const MedicalFileSchema = z.object({
  fileType: FileTypeSchema,
  id: z.string(),
  clinicId: z.string(),
  patientId: z.string(),
  providerId: z.string(),
  appointmentId: z.string().nullable(),
  treatmentId: z.string(),
  fileName: z.string(),
  fileUrl: z.string(),
})

export type MedicalFile = z.infer<typeof MedicalFileSchema>

export default MedicalFileSchema;
