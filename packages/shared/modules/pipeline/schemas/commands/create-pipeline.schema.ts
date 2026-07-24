import { z } from 'zod';

/**
 * Yeni satış hunisi oluşturur. organizationId body'de DEĞİL — actor context'inden gelir.
 * Aşamalar verilmezse varsayılan şablon (Yeni→...→Kazanıldı/Kaybedildi) seed'lenir.
 */
export const CreatePipelineSchema = z.object({
  name: z.string().min(1).optional(),
  isDefault: z.boolean().optional(),
  clinicId: z.uuid()
});
