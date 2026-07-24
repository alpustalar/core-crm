import { QueryResponse } from '@shared/common/response/response.interface';
import { PipelineResponse } from '@shared/modules/pipeline/interfaces';

export type GetPipelinesResponse = QueryResponse<PipelineResponse[]>;
