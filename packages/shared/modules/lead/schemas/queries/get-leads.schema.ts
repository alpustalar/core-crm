import { z } from 'zod';
import LeadSourceSchema from '@shared/generated-zod/inputTypeSchemas/LeadSourceSchema';
import LeadStatusSchema from '@shared/generated-zod/inputTypeSchemas/LeadStatusSchema';

/**
 * Filtre enum'ları elle yazılmaz, üretilmiş enum'lardan gelir. Elle yazıldığı
 * sürece bayatladı: `LeadSource` attribution çalışmasıyla 8 değere çıkarken
 * buradaki liste `['WHATSAPP','MANUAL']`de kalmıştı — yani kaynakların altısıyla
 * filtreleme yapılamıyor, denenirse istek doğrulamadan 400 ile dönüyordu.
 */
export const GetLeadsSchema = z.object({
  status: LeadStatusSchema.optional(),
  source: LeadSourceSchema.optional(),
  assignedToId: z.uuid().optional(),
});
