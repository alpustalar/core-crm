import { IGetContext } from '@common/decorators';

/**
 * Bir kliniğin WhatsApp kanalını pasifleştirir (isActive=false). Pasif kanal ne gelen
 * webhook routing'ine ne de giden gönderime dahil olur. Dönüş void.
 */
export class DisconnectClinicWhatsappChannelCommand {
  readonly __responseType!: void;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
