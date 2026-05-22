import { QueryResponse } from '@shared/common/response/response.interface';
import { Clinic } from '@prisma/client';

export type FindManyByOrganizationIdQueryResponse = QueryResponse<Clinic[]>;
