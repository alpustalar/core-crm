import { z } from 'zod';

/**
 * Yeniden yapım — orijinal iş emri kapanmaz/değişmez; satırları kopyalanmış yeni bir
 * DRAFT iş emri açılır ve `remakeOfId` ile orijinaline bağlanır.
 */
export const OpenRemakeWorkOrderSchema = z.object({
  reason: z.string().min(1),
  dueDate: z.coerce.date().nullable().optional(),
});
