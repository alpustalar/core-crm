import { ExceptionTypeSchema } from '@input-type-schemas/ExceptionTypeSchema';
import { z } from 'zod';

import dayjs from 'dayjs';

export const CreateProviderExceptionSchema = z
  .object({
    id: z.uuid().optional(),
    type: ExceptionTypeSchema,
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    reason: z.string().max(500).nullish(),
    providerId: z.uuid(),
  })
  .refine(
    (data) => {
      const start = dayjs(data.startTime).startOf('minute');
      const end = dayjs(data.endTime).startOf('minute');

      return end.isAfter(start);
    },
    {
      message:
        'İstisna bitiş zamanı, başlangıç zamanından önce veya başlangıç zamanına eşit olamaz.',
      path: ['endTime'],
    }
  );
export type CreateProviderExceptionProps = z.infer<
  typeof CreateProviderExceptionSchema
>;
