import { IGetContext } from '@common/decorators';

/**
 * Kliniğin Instagram kanalını koparır: kanal pasifleştirilir (routing + gönderim dışı).
 * Dönüş yok (void).
 */
export class DisconnectClinicInstagramChannelCommand {
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
