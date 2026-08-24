import { CashRegister } from '@model-schema/CashRegisterSchema';
import { FindCashRegistersFilter } from '@modules/finance/cash-register/domain/contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const CASH_REGISTER_QUERY_REPOSITORY = Symbol(
  'ICashRegisterQueryRepository'
);

export interface ICashRegisterQueryRepository {
  findById(id: string): Promise<CashRegister | null>;
  findByClinic(
    filter: FindCashRegistersFilter
  ): Promise<Paginated<CashRegister>>;
}
