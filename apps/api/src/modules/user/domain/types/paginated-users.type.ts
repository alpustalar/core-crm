import { User } from '@shared';
import { MapPaginationResult } from '@src/infrastructure/persistence/prisma/base.repository';

export type PaginatedUsers = MapPaginationResult<User>;
