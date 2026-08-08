import { IGetContext } from '@common/decorators';

export interface RegisterClinicWhatsappChannelInput {
  phoneNumberId: string;
  wabaId?: string;
  displayPhoneNumber?: string;
  accessToken?: string;
  verifyToken?: string;
}

/**
 * Bir kliniğin WhatsApp Business kanalını kaydeder/günceller (clinicId unique upsert).
 * accessToken CryptoService ile şifrelenip saklanır. Dönüş: kanal id'si.
 */
export class RegisterClinicWhatsappChannelCommand {
  readonly __responseType!: string;
  constructor(
    public readonly clinicId: string,
    public readonly input: RegisterClinicWhatsappChannelInput,
    public readonly ctx: IGetContext
  ) {}
}
