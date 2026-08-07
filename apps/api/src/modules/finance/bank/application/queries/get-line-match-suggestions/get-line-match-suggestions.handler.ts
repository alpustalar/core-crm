import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Decimal } from 'decimal.js';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import {
  BANK_STATEMENT_LINE_QUERY_REPOSITORY,
  IBankStatementLineQueryRepository,
} from '@modules/finance/bank/domain/repositories/bank-statement-line.repository';
import {
  BANK_STATEMENT_LINE_COMMAND_REPOSITORY,
  IBankStatementLineCommandRepository,
} from '@modules/finance/bank/domain/repositories/bank-statement-line.repository';
import { BankStatementLineNotFoundException } from '@modules/finance/bank/domain/exceptions/bank.exceptions';
import { LineMatchSuggestion } from '@modules/finance/bank/domain/contracts/bank.contracts';
import {
  DEFAULT_MATCH_OPTIONS,
  describeMatch,
  scoreCandidate,
} from '@modules/finance/bank/domain/rules/statement-line-matcher';
import { GetBankLedgerLinesQuery } from '@modules/finance/accounting/posting/application/queries/get-bank-ledger-lines/get-bank-ledger-lines.query';
import { GetLineMatchSuggestionsQuery } from './get-line-match-suggestions.query';
import { GetLineMatchSuggestionsResponse } from './get-line-match-suggestions.response';

/**
 * Öneri listesi oto-eşleştirmeyle **aynı motoru** kullanır; tek fark eşiktir:
 * tarama yalnız tek açık kazananı uygular, burada filtreyi geçen tüm adaylar
 * puan sırasıyla gösterilir. Böylece personel makinenin neden karar veremediğini
 * görür ve seçimi kendisi yapar.
 */
@QueryHandler(GetLineMatchSuggestionsQuery)
export class GetLineMatchSuggestionsHandler implements IQueryHandler<
  GetLineMatchSuggestionsQuery,
  GetLineMatchSuggestionsResponse
> {
  constructor(
    @Inject(BANK_STATEMENT_LINE_QUERY_REPOSITORY)
    private readonly lineQueryRepo: IBankStatementLineQueryRepository,
    @Inject(BANK_STATEMENT_LINE_COMMAND_REPOSITORY)
    private readonly lineCommandRepo: IBankStatementLineCommandRepository,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    query: GetLineMatchSuggestionsQuery
  ): Promise<GetLineMatchSuggestionsResponse> {
    const line = await this.lineQueryRepo.findById(query.lineId);
    if (!line) {
      throw new BankStatementLineNotFoundException(query.lineId);
    }

    const tolerance = DEFAULT_MATCH_OPTIONS.dateToleranceDays;

    const { data: rows } = await this.queryBus.execute(
      new GetBankLedgerLinesQuery({
        clinicId: line.clinicId,
        dateFrom: DateTimeManager.addDays(line.transactionDate, -tolerance),
        dateTo: DateTimeManager.addDays(line.transactionDate, tolerance),
        ctx: query.ctx,
      })
    );

    const matchable = {
      id: line.id,
      transactionDate: line.transactionDate,
      amount: new Decimal(line.amount.toString()),
      description: line.description,
      reference: line.reference,
      counterpartyName: line.counterpartyName,
    };

    const scored = rows
      .map((row) =>
        scoreCandidate(
          matchable,
          {
            lineId: row.lineId,
            entryId: row.entryId,
            entryNo: row.entryNo !== null ? BigInt(row.entryNo) : null,
            entryDate: row.entryDate,
            entryDescription: row.entryDescription,
            lineDesc: row.lineDesc,
            debit: new Decimal(row.debit),
            credit: new Decimal(row.credit),
          },
          DEFAULT_MATCH_OPTIONS
        )
      )
      .filter((s) => s !== null)
      .sort((a, b) => b!.score - a!.score);

    // Zaten başka bir ekstre satırına bağlı adaylar listeden çıkarılmaz;
    // işaretlenir — personel neden seçemediğini görsün.
    const usedRefs = new Set(
      await this.lineCommandRepo.findUsedMatchRefs(
        line.clinicId,
        scored.map((s) => s!.candidate.lineId)
      )
    );

    const suggestions: LineMatchSuggestion[] = scored.map((s) => {
      const { candidate, score, dayDifference } = s!;
      const amount = candidate.debit.isZero()
        ? candidate.credit
        : candidate.debit;
      return {
        matchedRef: candidate.lineId,
        entryId: candidate.entryId,
        entryNo:
          candidate.entryNo !== null ? candidate.entryNo.toString() : null,
        entryDate: candidate.entryDate,
        description: candidate.entryDescription ?? candidate.lineDesc,
        amount: amount.toFixed(2),
        score,
        dayDifference,
        reason: describeMatch(s!),
        alreadyUsed: usedRefs.has(candidate.lineId),
      };
    });

    return { data: suggestions };
  }
}
