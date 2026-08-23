import { z } from 'zod';

export const CreateProductCategorySchema = z.object({
  name: z.string().min(1).max(200),
  parentId: z.uuid().nullable().optional(),
  // organizationId ALINMAZ — clinicId'den türetilir (bkz. create-supplier).
  clinicId: z.uuid(),
});
