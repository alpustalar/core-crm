import { CashSession } from '@model-schema/CashSessionSchema';
import {
  CashSessionWithMovements,
  FindCashSessionsFilter,
} from '@modules/finance/cash-register/domain/contracts/cash-register.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const CASH_SESSION_QUERY_REPOSITORY = Symbol(
  'ICashSessionQueryRepository'
);

export interface ICashSessionQueryRepository {
  findById(id: string): Promise<CashSession | null>;
  findByIdWithMovements(id: string): Promise<CashSessionWithMovements | null>;
  findByClinic(filter: FindCashSessionsFilter): Promise<Paginated<CashSession>>;
  /** Bir kasada açık (OPEN) oturum varsa döner — read-side (get-open-cash-session). */
  findOpenByRegister(cashRegisterId: string): Promise<CashSession | null>;
}
