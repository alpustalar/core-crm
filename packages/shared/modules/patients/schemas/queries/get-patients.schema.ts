import { z } from 'zod';
import { PatientStatusSchema } from '@shared/generated-zod/inputTypeSchemas/PatientStatusSchema';

/**
 * Hasta listeleme filtresi. `organizationId` **bilerek yok**: kapsam aktörün
 * organizasyonudur ve sunucu onu bağlamdan alır — parametreyle geçilebilseydi
 * başka bir kiracının listesi istenebilirdi.
 */
export const GetPatientsSchema = z.object({
  clinicId: z.uuid().optional(),
  status: PatientStatusSchema.optional(),
  /** Ad, soyad, telefon veya protokol numarasında arar. */
  search: z.string().min(1).optional(),
});
