import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { CashRegister } from '@modules/finance/cash-register/domain/entities/cash-register.entity';
import { CashRegister as ICashRegister } from '@model-schema/CashRegisterSchema';
import { FindCashRegistersFilter } from '@modules/finance/cash-register/domain/contracts/cash-register.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const CASH_REGISTER_COMMAND_REPOSITORY = Symbol(
  'ICashRegisterCommandRepository'
);
export const CASH_REGISTER_QUERY_REPOSITORY = Symbol(
  'ICashRegisterQueryRepository'
);

export interface ICashRegisterCommandRepository extends IBaseCommandRepository<CashRegister> {
  /**
   * Kasayı `FOR UPDATE` ile kilitleyerek yükler — aynı kasada eşzamanlı oturum
   * açılışını serialize eder (tek-açık-oturum kuralı: çift-açılış yarışını önler).
   * Yalnız aktif transaction içinde çağrılır.
   */
  findByIdForUpdate(id: string): Promise<CashRegister | null>;
}

export interface ICashRegisterQueryRepository {
  findById(id: string): Promise<ICashRegister | null>;
  findByClinic(
    filter: FindCashRegistersFilter
  ): Promise<Paginated<ICashRegister>>;
}
