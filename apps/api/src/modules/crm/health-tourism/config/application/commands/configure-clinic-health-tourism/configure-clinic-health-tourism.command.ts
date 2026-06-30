import { IGetContext } from '@common/decorators';
import { ConfigureHealthTourismConfig } from '@shared/modules/health-tourism/types/commands';

/**
 * Bir kliniğin sağlık-turizmi config'ini oluşturur/günceller (clinicId unique upsert).
 * Dönüş: config id.
 */
export class ConfigureClinicHealthTourismCommand {
  readonly __responseType!: string;
  constructor(
    public readonly clinicId: string,
    public readonly input: ConfigureHealthTourismConfig,
    public readonly ctx: IGetContext
  ) {}
}
