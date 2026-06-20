import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetWhatsappTemplatesResponse } from './get-whatsapp-templates.response';

/** Kliniğin WABA'sında tanımlı WhatsApp şablonlarını listeler (FE şablon seçici için). */
export class GetWhatsappTemplatesQuery implements IQuery {
  readonly __responseType!: GetWhatsappTemplatesResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
