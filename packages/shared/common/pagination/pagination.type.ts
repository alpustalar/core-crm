import { PaginationSchema } from '@shared/common/pagination/pagination.schema';
import { z } from 'zod';

export type Pagination = z.infer<typeof PaginationSchema>;
