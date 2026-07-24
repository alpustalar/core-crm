import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { CashSession } from '@modules/finance/cash-register/domain/entities/cash-session.entity';
import { CashSession as ICashSession } from '@model-schema/CashSessionSchema';
import {
  CashBridgeTotals,
  CashMovementTotals,
  CashSessionWithMovements,
  FindCashSessionsFilter,
} from '@modules/finance/cash-register/domain/contracts/cash-register.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const CASH_SESSION_COMMAND_REPOSITORY = Symbol(
  'ICashSessionCommandRepository'
);
export const CASH_SESSION_QUERY_REPOSITORY = Symbol(
  'ICashSessionQueryRepository'
);

export interface ICashSessionCommandRepository extends IBaseCommandRepository<CashSession> {
  /**
   * Oturumu `FOR UPDATE` ile kilitleyerek yükler — eşzamanlı kapanış/hareket
   * yarışını serialize eder. Yalnız aktif transaction içinde çağrılır.
   */
  findByIdForUpdate(id: string): Promise<CashSession | null>;

  /**
   * Bir kasada açık (OPEN) oturum varsa döner. Açılış handler'ında register kilidi
   * altında çağrılır — tek-açık-oturum kuralının atomik kontrolü için command repo'da.
   */
  findOpenByRegister(cashRegisterId: string): Promise<ICashSession | null>;

  /**
   * Oturumdaki hareketlerin yön bazlı toplamı (kapanış beklenen tutar hesabı).
   * Kapanış mutasyonunu beslediği için command repo'dadır (CQRS write-side).
   */
  sumMovements(cashSessionId: string): Promise<CashMovementTotals>;

  /**
   * Muhasebe köprüsü için tür-bazlı toplamlar (BANK_DEPOSIT + EXPENSE) — kapanış
   * fişini beslediği için command repo'dadır.
   */
  sumBridgeMovements(cashSessionId: string): Promise<CashBridgeTotals>;
}

export interface ICashSessionQueryRepository {
  findById(id: string): Promise<ICashSession | null>;
  findByIdWithMovements(id: string): Promise<CashSessionWithMovements | null>;
  findByClinic(
    filter: FindCashSessionsFilter
  ): Promise<Paginated<ICashSession>>;
  /** Bir kasada açık (OPEN) oturum varsa döner — read-side (get-open-cash-session). */
  findOpenByRegister(cashRegisterId: string): Promise<ICashSession | null>;
}
