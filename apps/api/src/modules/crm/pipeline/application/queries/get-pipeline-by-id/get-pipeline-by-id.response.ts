import { QueryResponse } from '@shared/common/response/response.interface';
import { PipelineResponse } from '@shared/modules/pipeline/interfaces';

export type GetPipelineByIdResponse = QueryResponse<PipelineResponse | null>;
