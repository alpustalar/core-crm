import { IGetContext } from '@common/decorators';
import { TemplateHeaderMediaType } from '@modules/messaging/conversation/domain/types/create-message.props';

export interface SendTemplateMessageInput {
  conversationId: string;
  templateName: string;
  languageCode: string;
  /** Şablonun body değişkenleri (sıralı). */
  variables?: string[];
  /** header text component değişkeni. */
  headerText?: string;
  /** header media (image/video/document) link'i. */
  headerMediaUrl?: string;
  headerMediaType?: TemplateHeaderMediaType;
  /** dinamik URL buton suffix'leri (buton index sırasına göre). */
  buttonParams?: string[];
  /** Şablon kategorisi (FE şablon listesinden bilir). MARKETING ise opt-out kontrol edilir. */
  category?: string;
}

/**
 * Bir yazışmaya onaylı WhatsApp şablonu (HSM) gönderir. 24s servis penceresine tabi
 * DEĞİLDİR (proaktif/bildirim mesajı). Dönüş: oluşturulan Message id'si.
 */
export class SendTemplateMessageCommand {
  readonly __responseType!: string;
  constructor(
    public readonly clinicId: string,
    public readonly input: SendTemplateMessageInput,
    public readonly ctx: IGetContext
  ) {}
}
