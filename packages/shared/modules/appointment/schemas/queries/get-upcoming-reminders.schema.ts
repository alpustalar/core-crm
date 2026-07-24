import { z } from 'zod';

/**
 * Resepsiyon hatırlatma listesi: şu andan itibaren hoursAhead saat içindeki onaylı
 * yaklaşan randevular (aranıp/hatırlatılıp teyit edilecekler), sayfalı. clinicId
 * gövdede taşınmaz — handler aktörün kliniğini kullanır.
 */
export const GetUpcomingRemindersSchema = z
  .object({
    limit: z.coerce.number().min(1).max(100).optional().default(20),
    page: z.coerce.number().min(1).default(1),
    orderBy: z.enum(['asc', 'desc']).default('asc'),
    orderByColumn: z.string().default('startTime'),
    hoursAhead: z.coerce.number().min(1).max(168).optional().default(24),
    clinicId: z.uuid(),
  })
  .transform((data) => {
    const { limit, page, orderBy, orderByColumn, hoursAhead,clinicId } = data;
    return {
      hoursAhead,
      clinicId,
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
