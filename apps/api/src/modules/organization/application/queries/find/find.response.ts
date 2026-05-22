import { QueryResponse } from '@shared/common/response/response.interface';
import { Organization } from '@modules/organization/domain/entities/organization.entity';

export type FindQueryResponse = QueryResponse<Organization>;
