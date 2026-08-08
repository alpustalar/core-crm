import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetClinicAiAgentConfigResponse } from './get-clinic-ai-agent-config.response';

/** Bir kliniğin AI asistan config'ini döner (anahtar maskeli); yoksa null. */
export class GetClinicAiAgentConfigQuery implements IQuery {
  readonly __responseType!: GetClinicAiAgentConfigResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
