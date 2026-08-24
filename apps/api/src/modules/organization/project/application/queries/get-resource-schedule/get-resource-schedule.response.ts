import { QueryResponse } from '@shared/common/response/response.interface';
import { ResourceScheduleRow } from '@modules/organization/project/domain/contracts';

export type GetResourceScheduleResponse = QueryResponse<ResourceScheduleRow[]>;
