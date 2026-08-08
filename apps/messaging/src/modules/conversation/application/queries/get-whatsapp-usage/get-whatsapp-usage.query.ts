import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetWhatsappUsageResponse } from './get-whatsapp-usage.response';

/** Bir dönemde kliniğin faturalanabilir WhatsApp konuşmalarının kategori kırılımı. */
export class GetWhatsappUsageQuery implements IQuery {
  readonly __responseType!: GetWhatsappUsageResponse;
  constructor(
    public readonly payload: {
      clinicId: string;
      from: Date;
      to: Date;
      ctx: IGetContext;
    }
  ) {}
}
