import { IGetContext } from '@common/decorators';
import { UpdateWhatsappBusinessProfileInput } from '@modules/channel-config/domain/interfaces/whatsapp-cloud-api.interface';

/** Kliniğin WhatsApp Business işletme profilini günceller (yalnızca verilen alanlar). */
export class UpdateWhatsappBusinessProfileCommand {
  readonly __responseType!: void;
  constructor(
    public readonly clinicId: string,
    public readonly input: UpdateWhatsappBusinessProfileInput,
    public readonly ctx: IGetContext
  ) {}
}
