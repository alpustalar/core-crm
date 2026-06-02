import { z } from 'zod';
import { AppointmentStatusSchema } from '@shared/generated-zod/inputTypeSchemas/AppointmentStatusSchema';

export const GetOrganizationAppointmentsSchema = z
  .object({
    limit: z.coerce.number().min(1).max(100).optional().default(20),
    page: z.coerce.number().min(1).default(1),
    orderBy: z.enum(['asc', 'desc']).default('desc'),
    orderByColumn: z.string().default('startTime'),
    organizationId: z.uuid(),
    clinicId: z.uuid().optional(),
    status: z.enum(AppointmentStatusSchema.enum).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
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
