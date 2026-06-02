import { z } from 'zod';

export const CreateProviderShiftItemSchema = z
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
    },
  );

export const CreateProviderShiftSchema = z
  .object({
    providerId: z.string().uuid(),
    shifts: z
      .array(CreateProviderShiftItemSchema)
      .min(1, { message: 'En az bir vardiya girişi gereklidir' })
      .max(7, { message: 'Bir haftada en fazla 7 vardiya girilebilir' }),
  })
  .refine(
    (d) => {
      const dateKeys = d.shifts.map((s) => s.date.toISOString().slice(0, 10));
      return new Set(dateKeys).size === dateKeys.length;
    },
    {
      message: 'Her tarih için yalnızca bir vardiya girilebilir',
      path: ['shifts'],
    },
  );
