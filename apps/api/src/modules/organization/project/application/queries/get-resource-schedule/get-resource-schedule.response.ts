import { QueryResponse } from '@shared/common/response/response.interface';
import { ResourceScheduleRow } from '@modules/organization/project/domain/contracts/project.contracts';

export type GetResourceScheduleResponse = QueryResponse<ResourceScheduleRow[]>;
