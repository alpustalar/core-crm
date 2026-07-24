import { z } from 'zod';

/** Ajans ROI raporu filtresi. clinicId route'tan gelir; from/to zorunlu, campaignId opsiyonel. */
export const GetRoiReportSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  campaignId: z.string().optional(),
});
