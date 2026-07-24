import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetVatDeclarationResponse } from './get-vat-declaration.response';

/**
 * KDV beyan özeti (doc 06 §1, doc 08): bir şubenin POSTED fişlerinde Hesaplanan KDV
 * (391) ve İndirilecek KDV (191) toplamından dönem KDV durumu. 391 > 191 → Ödenecek
 * KDV (360); 191 > 391 → Devreden KDV (190, sonraki aya). Verilen tarih aralığı
 * tek beyan dönemi gibi değerlendirilir; aylar bilgi amaçlı ayrıca dökülür.
 */
export class GetVatDeclarationQuery implements IQuery {
  readonly __responseType!: GetVatDeclarationResponse;
  constructor(
    public readonly payload: {
      clinicId: string;
      ctx: IGetContext;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ) {}
}
