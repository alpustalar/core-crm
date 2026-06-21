import { IGetContext } from '@common/decorators';

/** Bir kliniğin AI asistanını açar/kapatır (config var olmalı). */
export class SetClinicAiAgentEnabledCommand {
  constructor(
    public readonly clinicId: string,
    public readonly enabled: boolean,
    public readonly ctx: IGetContext
  ) {}
}
