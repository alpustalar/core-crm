import { MapPaginationResult } from '@src/infrastructure/persistence/prisma/base.repository';
import { UserSummary } from './user-summary.type';

export type PaginatedUsers = MapPaginationResult<UserSummary>;
