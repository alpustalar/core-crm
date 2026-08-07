import { Injectable } from '@nestjs/common';
import { JournalEntryStatus, Prisma } from '@prisma/client';
import { Pagination, JournalEntry as IJournalEntry } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import {
  AccountLedger,
  AccountLedgerFilter,
  BankLedgerLineRow,
  BankLedgerLinesFilter,
  CashFlow,
  CashFlowFilter,
  FindJournalEntriesFilter,
  IJournalQueryRepository,
  JournalReportFilter,
  JournalReportRow,
  TrialBalanceFilter,
  TrialBalanceRow,
  VatDeclaration,
  VatDeclarationFilter,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { queryTrialBalance } from './journal-trial-balance.query';

/**
 * Okuma tarafı: entity hidrate edilmez. Defter append-only olduğu için raporlarda
 * domain davranışı gerekmez; storno/kapanış gibi yazma kararını besleyen okumalar
 * Command Repo'dadır.
 */
@Injectable()
export class JournalQueryRepository
  extends BaseRepository
  implements IJournalQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findMany(
    filter: FindJournalEntriesFilter,
    pagination: Pagination
  ): Promise<{ items: IJournalEntry[]; total: number }> {
    const where: Prisma.JournalEntryWhereInput = {
      organizationId: filter.organizationId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.periodId ? { periodId: filter.periodId } : {}),
    };

    return paginate({
      delegate: this.db.journalEntry,
      pagination,
      where,
    });
  }

  trialBalance(filter: TrialBalanceFilter): Promise<TrialBalanceRow[]> {
    return queryTrialBalance(this.db, filter);
  }

  async accountLedger(filter: AccountLedgerFilter): Promise<AccountLedger> {
    const baseEntryWhere: Prisma.JournalEntryWhereInput = {
      clinicId: filter.clinicId,
      status: JournalEntryStatus.POSTED,
    };

    // Açılış devri: dateFrom öncesi POSTED satırların net bakiyesi.
    let openingBalance = new Prisma.Decimal(0);
    if (filter.dateFrom) {
      const agg = await this.db.journalLine.aggregate({
        where: {
          accountId: filter.accountId,
          entry: { ...baseEntryWhere, entryDate: { lt: filter.dateFrom } },
        },
        _sum: { debit: true, credit: true },
      });
      openingBalance = (agg._sum.debit ?? new Prisma.Decimal(0)).minus(
        agg._sum.credit ?? new Prisma.Decimal(0)
      );
    }

    const entryWhere: Prisma.JournalEntryWhereInput = { ...baseEntryWhere };
    if (filter.dateFrom || filter.dateTo) {
      entryWhere.entryDate = { gte: filter.dateFrom, lte: filter.dateTo };
    }

    const rows = await this.db.journalLine.findMany({
      where: { accountId: filter.accountId, entry: entryWhere },
      include: {
        entry: {
          select: {
            id: true,
            entryNo: true,
            entryDate: true,
            description: true,
          },
        },
      },
      orderBy: [{ entry: { entryDate: 'asc' } }, { entry: { entryNo: 'asc' } }],
    });

    return {
      openingBalance,
      movements: rows.map((row) => ({
        entryId: row.entry.id,
        entryNo: row.entry.entryNo,
        entryDate: row.entry.entryDate,
        description: row.entry.description,
        lineDesc: row.lineDesc,
        debit: row.debit,
        credit: row.credit,
      })),
    };
  }

  async journalReport(
    filter: JournalReportFilter,
    pagination: Pagination
  ): Promise<{ items: JournalReportRow[]; total: number }> {
    const where: Prisma.JournalEntryWhereInput = {
      clinicId: filter.clinicId,
      status: JournalEntryStatus.POSTED,
    };
    if (filter.dateFrom || filter.dateTo) {
      where.entryDate = { gte: filter.dateFrom, lte: filter.dateTo };
    }

    // Yevmiye sırası entryDate + entryNo'dur; paginate helper tek kolon desteklediği
    // için sorgu burada elle kurulur.
    const [rows, total] = await Promise.all([
      this.db.journalEntry.findMany({
        where,
        select: {
          id: true,
          entryNo: true,
          entryDate: true,
          description: true,
          status: true,
          lines: {
            select: {
              accountId: true,
              partyId: true,
              debit: true,
              credit: true,
              lineDesc: true,
            },
          },
        },
        orderBy: [{ entryDate: 'asc' }, { entryNo: 'asc' }],
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.db.journalEntry.count({ where }),
    ]);

    return { items: rows, total };
  }

  async cashFlow(filter: CashFlowFilter): Promise<CashFlow> {
    if (filter.accountIds.length === 0) {
      return { openingBalance: new Prisma.Decimal(0), movements: [] };
    }

    const baseEntryWhere: Prisma.JournalEntryWhereInput = {
      clinicId: filter.clinicId,
      status: JournalEntryStatus.POSTED,
    };

    // Açılış nakit pozisyonu: dateFrom öncesi nakit hesap satırlarının net bakiyesi.
    let openingBalance = new Prisma.Decimal(0);
    if (filter.dateFrom) {
      const agg = await this.db.journalLine.aggregate({
        where: {
          accountId: { in: filter.accountIds },
          entry: { ...baseEntryWhere, entryDate: { lt: filter.dateFrom } },
        },
        _sum: { debit: true, credit: true },
      });
      openingBalance = (agg._sum.debit ?? new Prisma.Decimal(0)).minus(
        agg._sum.credit ?? new Prisma.Decimal(0)
      );
    }

    const entryWhere: Prisma.JournalEntryWhereInput = { ...baseEntryWhere };
    if (filter.dateFrom || filter.dateTo) {
      entryWhere.entryDate = { gte: filter.dateFrom, lte: filter.dateTo };
    }

    const rows = await this.db.journalLine.findMany({
      where: { accountId: { in: filter.accountIds }, entry: entryWhere },
      include: { entry: { select: { entryDate: true } } },
      orderBy: { entry: { entryDate: 'asc' } },
    });

    return {
      openingBalance,
      movements: rows.map((row) => ({
        entryDate: row.entry.entryDate,
        debit: row.debit,
        credit: row.credit,
      })),
    };
  }

  async vatDeclaration(filter: VatDeclarationFilter): Promise<VatDeclaration> {
    const entryWhere: Prisma.JournalEntryWhereInput = {
      clinicId: filter.clinicId,
      status: JournalEntryStatus.POSTED,
    };
    if (filter.dateFrom || filter.dateTo) {
      entryWhere.entryDate = { gte: filter.dateFrom, lte: filter.dateTo };
    }

    const fetch = (accountIds: string[]) =>
      accountIds.length === 0
        ? Promise.resolve(
            [] as {
              entry: { entryDate: Date };
              debit: Prisma.Decimal;
              credit: Prisma.Decimal;
            }[]
          )
        : this.db.journalLine.findMany({
            where: { accountId: { in: accountIds }, entry: entryWhere },
            select: {
              debit: true,
              credit: true,
              entry: { select: { entryDate: true } },
            },
            orderBy: { entry: { entryDate: 'asc' } },
          });

    const [outputRows, inputRows] = await Promise.all([
      fetch(filter.outputAccountIds),
      fetch(filter.inputAccountIds),
    ]);

    const toRows = (
      rows: {
        entry: { entryDate: Date };
        debit: Prisma.Decimal;
        credit: Prisma.Decimal;
      }[]
    ) =>
      rows.map((row) => ({
        entryDate: row.entry.entryDate,
        debit: row.debit,
        credit: row.credit,
      }));

    return { output: toRows(outputRows), input: toRows(inputRows) };
  }

  async bankLedgerLines(
    filter: BankLedgerLinesFilter
  ): Promise<BankLedgerLineRow[]> {
    if (filter.accountIds.length === 0) return [];

    const rows = await this.db.journalLine.findMany({
      where: {
        accountId: { in: filter.accountIds },
        entry: {
          clinicId: filter.clinicId,
          status: JournalEntryStatus.POSTED,
          entryDate: { gte: filter.dateFrom, lte: filter.dateTo },
        },
      },
      select: {
        id: true,
        debit: true,
        credit: true,
        lineDesc: true,
        entry: {
          select: {
            id: true,
            entryNo: true,
            entryDate: true,
            description: true,
          },
        },
      },
      orderBy: { entry: { entryDate: 'asc' } },
    });

    return rows.map((row) => ({
      lineId: row.id,
      entryId: row.entry.id,
      entryNo: row.entry.entryNo,
      entryDate: row.entry.entryDate,
      entryDescription: row.entry.description,
      lineDesc: row.lineDesc,
      debit: row.debit,
      credit: row.credit,
    }));
  }
}
