import { IGetContext } from '@common/decorators';

/**
 * Kliniğin Telegram kanalını koparır: Bot webhook'u kaldırılır ve kanal REVOKED'a
 * çekilir (routing + gönderim dışı). Dönüş yok (void).
 */
export class DisconnectClinicTelegramChannelCommand {
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
