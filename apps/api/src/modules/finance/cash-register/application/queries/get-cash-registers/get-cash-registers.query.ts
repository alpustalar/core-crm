import { IQuery } from '@nestjs/cqrs';
import { GetCashRegisters } from '@shared/modules/cash-register/types/queries';
import { Pagination } from '@shared/common';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetCashRegistersResponse } from './get-cash-registers.response';

export class GetCashRegistersQuery implements IQuery {
  readonly __responseType!: GetCashRegistersResponse;
  constructor(
    public readonly payload: {
      readonly filter: GetCashRegisters;
      readonly pagination: Pagination;
      readonly ctx: IGetContext;
    }
  ) {}
}
