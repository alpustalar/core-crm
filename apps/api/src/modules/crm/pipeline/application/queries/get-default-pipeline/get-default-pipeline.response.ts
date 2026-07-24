import { QueryResponse } from '@shared/common/response/response.interface';
import { PipelineWithStages } from '@modules/crm/pipeline/domain/contracts/pipeline.contracts';

export type GetDefaultPipelineResponse = QueryResponse<PipelineWithStages | null>;
