import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetWhatsappUsageResponse } from './get-whatsapp-usage.response';

/** Bir dönemde kliniğin faturalanabilir WhatsApp konuşmalarının kategori kırılımı. */
export class GetWhatsappUsageQuery implements IQuery {
  readonly __responseType!: GetWhatsappUsageResponse;
  constructor(
    public readonly clinicId: string,
    public readonly from: Date,
    public readonly to: Date,
    public readonly ctx: IGetContext
  ) {}
}
