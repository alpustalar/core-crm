import { z } from 'zod';

/** HR manuel devam/mesai düzeltmesi — belirli bir gün için giriş/çıkış saatini elle girer/düzeltir. */
export const RecordAttendanceSchema = z.object({
  workDate: z.coerce.date(),
  checkInAt: z.coerce.date(),
  checkOutAt: z.coerce.date(),
  note: z.string().nullable().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid().nullable().optional(),
});
