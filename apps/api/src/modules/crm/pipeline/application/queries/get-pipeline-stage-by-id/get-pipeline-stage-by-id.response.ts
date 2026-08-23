import { QueryResponse } from '@shared/common/response/response.interface';
import { PipelineStageView } from '@modules/crm/pipeline/domain/contracts/pipeline.contracts';

export type GetPipelineStageByIdResponse =
  QueryResponse<PipelineStageView | null>;
