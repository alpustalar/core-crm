import { z } from 'zod';

export const PaginationSchema = z
  .object({
    limit: z.coerce.number().min(1).max(100).default(10),
    page: z.coerce.number().min(1).default(1),
    orderBy: z.enum(['asc', 'desc']).optional().default('desc'),
    orderByColumn: z.string().optional().default('createdAt'),
    search: z.string().optional(),
    searchColumn: z.string().optional(),
    searchOperator: z.enum(['AND', 'OR', 'NOT']).optional().default('AND'),
  })
  .transform((data) => ({
    ...data,
    take: data.limit,
    skip: (data.page - 1) * data.limit,
  }));