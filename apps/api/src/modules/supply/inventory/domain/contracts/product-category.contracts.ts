import { z } from 'zod';

export const CreateProductCategorySchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1, 'Kategori adı zorunludur'),
  organizationId: z.uuid(),
  clinicId: z.uuid(),
  parentId: z.uuid().nullable().optional(),
});
export type CreateProductCategoryProps = z.infer<
  typeof CreateProductCategorySchema
>;
