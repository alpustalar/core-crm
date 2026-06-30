import { z } from 'zod';
import { ProviderIdentitySchema } from '@shared/modules/provider/schemas/provider-identity.schema';

export const CreateProviderAvailabilityItemSchema = z
  .object({
    date: z.coerce.date(),
    startMinute: z.number().int().min(0).max(1439),
    endMinute: z.number().int().min(1).max(1440),
    breakStartMinute: z.number().int().min(0).max(1439).optional(),
    breakEndMinute: z.number().int().min(1).max(1440).optional(),
  })
  .refine((d) => d.startMinute < d.endMinute, {
    message: 'Başlangıç saati bitiş saatinden önce olmalıdır',
    path: ['startMinute'],
  })
  .refine(
    (d) =>
      d.breakStartMinute === undefined ||
      d.breakEndMinute === undefined ||
      d.breakStartMinute < d.breakEndMinute,
    {
      message: 'Mola başlangıcı bitiş saatinden önce olmalıdır',
      path: ['breakStartMinute'],
    }
  );

export const CreateProviderAvailabilitySchema = z.object({
  availabilities: z
    .array(CreateProviderAvailabilityItemSchema)
    .min(1, { message: 'En az bir müsaitlik girişi gereklidir' }),
  providerId: z.uuid(),
});
