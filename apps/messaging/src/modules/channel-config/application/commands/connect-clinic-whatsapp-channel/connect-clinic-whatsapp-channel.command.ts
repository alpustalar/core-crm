import { IGetContext } from '@common/decorators';

export interface ConnectClinicWhatsappChannelInput {
  /** Embedded Signup'tan dönen yetki kodu. */
  code: string;
  /** Embedded Signup callback'inden gelen WhatsApp Business Account id. */
  wabaId: string;
  /** Embedded Signup callback'inden gelen telefon numarası id'si. */
  phoneNumberId: string;
  displayPhoneNumber?: string;
}

/**
 * Self-service: klinik kendi WhatsApp Business hesabını Embedded Signup ile bağlar.
 * Yetki kodu token'a çevrilir, WABA platform app webhook'una abone edilir, kanal
 * (şifreli token ile) kaydedilir. Dönüş: kanal id'si.
 */
export class ConnectClinicWhatsappChannelCommand {
  readonly __responseType!: string;
  constructor(
    public readonly clinicId: string,
    public readonly input: ConnectClinicWhatsappChannelInput,
    public readonly ctx: IGetContext
  ) {}
}
