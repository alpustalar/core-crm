import { IGetContext } from '@common/decorators';

export interface ConnectClinicInstagramChannelInput {
  /** Facebook/Instagram Login'den dönen yetki kodu. */
  code: string;
  /** Instagram professional account id (webhook routing + gönderim hedefi). */
  igUserId: string;
  /** Bağlı Facebook Page id (FB Login akışında). */
  pageId?: string;
  /** IG kullanıcı adı (gösterim). */
  username?: string;
}

/**
 * Self-service: klinik kendi Instagram professional hesabını Facebook/Instagram Login ile
 * bağlar. Yetki kodu token'a çevrilir, hesap app webhook'una (messages) abone edilir, kanal
 * (şifreli token ile) kaydedilir. Dönüş: kanal id'si.
 */
export class ConnectClinicInstagramChannelCommand {
  readonly __responseType!: string;
  constructor(
    public readonly clinicId: string,
    public readonly input: ConnectClinicInstagramChannelInput,
    public readonly ctx: IGetContext
  ) {}
}
