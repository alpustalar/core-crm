import { IQuery } from '@nestjs/cqrs';
import { GetTaxRateResponse } from './get-tax-rate.response';
import { TaxParameterKeyType } from '@input-type-schemas/TaxParameterKeySchema';

/**
 * Bir şube için belirli tarihte yürürlükteki vergi oranını çözer.
 * Modüller arası giriş noktası (örn. fatura kesilirken KDV oranı).
 */
export class GetTaxRateQuery implements IQuery {
  readonly __responseType!: GetTaxRateResponse;
  constructor(
    public readonly clinicId: string,
    public readonly key: TaxParameterKeyType,
    public readonly date: Date
  ) {}
}
