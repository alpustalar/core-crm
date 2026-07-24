import { IGetContext } from '@common/decorators';
import { ConfigureAiAgent } from '@shared/modules/messaging/types/commands';

/**
 * Bir kliniğin AI sohbet asistanı config'ini oluşturur/günceller (clinicId unique upsert).
 * apiKey verilirse TokenCipherService ile şifrelenir; verilmezse mevcut korunur. Dönüş: config id.
 */
export class ConfigureClinicAiAgentCommand {
  readonly __responseType!: string;
  constructor(
    public readonly payload: {
      clinicId: string;
      input: ConfigureAiAgent;
      ctx: IGetContext;
    }
  ) {}
}
