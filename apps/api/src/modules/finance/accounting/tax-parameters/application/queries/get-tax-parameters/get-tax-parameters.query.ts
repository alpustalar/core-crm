import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetTaxParametersResponse } from './get-tax-parameters.response';

/** Bir şubenin tüm vergi parametrelerini (tüm sürümler) listeler. */
export class GetTaxParametersQuery implements IQuery {
  readonly __responseType!: GetTaxParametersResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
