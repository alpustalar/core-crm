import { BankStatementLine as IBankStatementLine } from '@shared';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { BankStatementLine } from '@modules/finance/bank/domain/entities/bank-statement-line.entity';

export const BANK_STATEMENT_LINE_COMMAND_REPOSITORY = Symbol(
  'IBankStatementLineCommandRepository'
);
export const BANK_STATEMENT_LINE_QUERY_REPOSITORY = Symbol(
  'IBankStatementLineQueryRepository'
);

export type IBankStatementLineCommandRepository =
  IBaseCommandRepository<BankStatementLine> & {
    /**
     * Bir ekstrenin mutabık edilmemiş satırlarını yazma tarafı için yükler.
     * Oto-eşleştirme taramasının girdisi; okuma doğrudan MATCHED yazma kararını
     * beslediği için Command Context'e aittir.
     */
    findUnmatchedByStatementId(
      bankStatementId: string
    ): Promise<BankStatementLine[]>;

    /**
     * Verilen defter satırı referanslarından hangileri klinik kapsamında BAŞKA bir
     * ekstre satırına zaten bağlanmış? Bir 102 hareketinin iki ekstre satırıyla
     * mutabık edilmesini (çift sayım) engeller.
     */
    findUsedMatchRefs(clinicId: string, refs: string[]): Promise<string[]>;

    /** Tarama sonucu değişen satırları toplu yazar. */
    updateMany(entities: BankStatementLine[]): Promise<void>;
  };

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IBankStatementLineQueryRepository {
  findById(id: string): Promise<IBankStatementLine | null>;
}
