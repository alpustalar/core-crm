import { QueryResponse } from '@shared/common/response/response.interface';
import { Clinic } from '@shared';

export type FindManyByOrganizationIdQueryResponse = QueryResponse<Clinic[]>;
