import { z } from 'zod';
import { AppointmentStatusSchema } from '@shared/generated-zod/inputTypeSchemas/AppointmentStatusSchema';

/**
 * Resepsiyon randevu araması: hasta adı/telefonuna göre + opsiyonel status/doktor/
 * tarih aralığı filtresiyle, sayfalı. clinicId gövdede taşınmaz — handler aktörün
 * kliniğini kullanır (resepsiyonist yalnız kendi kliniğinde arar).
 */
export const SearchClinicAppointmentsSchema = z
  .object({
    limit: z.coerce.number().min(1).max(100).optional().default(20),
    page: z.coerce.number().min(1).default(1),
    orderBy: z.enum(['asc', 'desc']).default('asc'),
    orderByColumn: z.string().default('startTime'),
    search: z.string().trim().min(1).optional(),
    status: z.enum(AppointmentStatusSchema.enum).optional(),
    providerId: z.uuid().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    clinicId: z.uuid(),
  })
  .transform((data) => {
    const { limit, page, orderBy, orderByColumn, ...rest } = data;
    return {
      ...rest,
      pagination: {
        take: limit,
        skip: (page - 1) * limit,
        limit,
        page,
        orderBy,
        orderByColumn,
        searchOperator: 'AND' as const,
      },
    };
  });
