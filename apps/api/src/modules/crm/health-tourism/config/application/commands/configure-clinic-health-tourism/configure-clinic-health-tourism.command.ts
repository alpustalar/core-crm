import { IGetContext } from '@common/decorators';
import { ConfigureHealthTourismConfig } from '@shared/modules/health-tourism';

/**
 * Bir kliniğin sağlık-turizmi config'ini oluşturur/günceller (clinicId unique upsert).
 * Dönüş: config id.
 */
export class ConfigureClinicHealthTourismCommand {
  readonly __responseType!: string;
  constructor(
    public readonly payload: {
      readonly clinicId: string;
      readonly organizationId?: string | null;
      readonly data: ConfigureHealthTourismConfig;
      readonly ctx: IGetContext;
    }
  ) {}
}
