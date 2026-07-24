import { IGetContext } from '@common/decorators';

/** Bir kliniğin AI asistanını açar/kapatır (config var olmalı). */
export class SetClinicAiAgentEnabledCommand {
  constructor(
    public readonly payload: {
      clinicId: string;
      enabled: boolean;
      ctx: IGetContext;
    }
  ) {}
}
