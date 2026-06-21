import { IQuery } from '@nestjs/cqrs';
import { GetAiAgentRuntimeConfigResponse } from './get-ai-agent-runtime-config.response';

/**
 * Internal: AI yanıt akışı için kliniğin çözülmüş (decrypted) config'ini döner.
 * Controller'a açılmaz; yalnız AiReplyProcessor kullanır.
 */
export class GetAiAgentRuntimeConfigQuery implements IQuery {
  readonly __responseType!: GetAiAgentRuntimeConfigResponse;
  constructor(public readonly clinicId: string) {}
}
