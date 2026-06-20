import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetWhatsappBusinessProfileResponse } from './get-whatsapp-business-profile.response';

/** Kliniğin WhatsApp Business işletme profilini (Graph API'den) döner. */
export class GetWhatsappBusinessProfileQuery implements IQuery {
  readonly __responseType!: GetWhatsappBusinessProfileResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
