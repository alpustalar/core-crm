import { IGetContext } from '@common/decorators';
import { ConfigureHealthTourismConfigDto } from '@shared/modules/health-tourism/dto/commands';

/**
 * Bir kliniğin sağlık-turizmi config'ini oluşturur/günceller (clinicId unique upsert).
 * Dönüş: config id.
 */
export class ConfigureClinicHealthTourismCommand {
  readonly __responseType!: string;
  constructor(
    public readonly clinicId: string,
    public readonly dto: ConfigureHealthTourismConfigDto,
    public readonly ctx: IGetContext
  ) {}
}
