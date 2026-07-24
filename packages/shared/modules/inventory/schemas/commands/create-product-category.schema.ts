import { z } from 'zod';

export const CreateProductCategorySchema = z.object({
  name: z.string().min(1).max(200),
  parentId: z.uuid().nullable().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
});
