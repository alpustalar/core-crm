import { Injectable } from '@nestjs/common';
import { JournalEntryStatus, Prisma } from '@prisma/client';
import { Pagination } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import {
  AccountLedger,
  AccountLedgerFilter,
  FindJournalEntriesFilter,
  IJournalQueryRepository,
  JournalReportFilter,
  TrialBalanceFilter,
  TrialBalanceRow,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { JournalEntry } from '@modules/finance/accounting/posting/domain/entities/journal-entry.entity';
import { JournalLine } from '@modules/finance/accounting/posting/domain/entities/journal-line.entity';

type JournalEntryWithLines = Prisma.JournalEntryGetPayload<{
  include: { lines: true };
}>;

@Injectable()
export class JournalQueryRepository
  extends BaseRepository
  implements IJournalQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<JournalEntry | null> {
    const raw = await this.db.journalEntry.findUnique({
      where: { id },
      include: { lines: true },
    });
    return raw ? this.toEntity(raw) : null;
  }

  async findByEventId(eventId: string): Promise<JournalEntry | null> {
    const raw = await this.db.journalEntry.findUnique({
      where: { eventId },
      include: { lines: true },
    });
    return raw ? this.toEntity(raw) : null;
  }

  async findMany(
    filter: FindJournalEntriesFilter,
    pagination: Pagination
  ): Promise<{ items: JournalEntry[]; total: number }> {
    const where: Prisma.JournalEntryWhereInput = {
      organizationId: filter.organizationId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.periodId ? { periodId: filter.periodId } : {}),
    };

    const result = await paginate({
      delegate: this.db.journalEntry,
      pagination,
      where,
      include: { lines: true },
    });

    return {
      items: result.items.map((raw) =>
        this.toEntity(raw as JournalEntryWithLines)
      ),
      total: result.total,
    };
  }

  async trialBalance(filter: TrialBalanceFilter): Promise<TrialBalanceRow[]> {
    const entryWhere: Prisma.JournalEntryWhereInput = {
      clinicId: filter.clinicId,
      status: JournalEntryStatus.POSTED,
    };
    if (filter.dateFrom || filter.dateTo) {
      entryWhere.entryDate = { gte: filter.dateFrom, lte: filter.dateTo };
    }

    const grouped = await this.db.journalLine.groupBy({
      by: ['accountId'],
      where: { entry: entryWhere },
      _sum: { debit: true, credit: true },
    });

    return grouped.map((row) => ({
      accountId: row.accountId,
      totalDebit: row._sum.debit ?? new Prisma.Decimal(0),
      totalCredit: row._sum.credit ?? new Prisma.Decimal(0),
    }));
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
      orderBy: [
        { entry: { entryDate: 'asc' } },
        { entry: { entryNo: 'asc' } },
      ],
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
  ): Promise<{ items: JournalEntry[]; total: number }> {
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
        include: { lines: true },
        orderBy: [{ entryDate: 'asc' }, { entryNo: 'asc' }],
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.db.journalEntry.count({ where }),
    ]);

    return {
      items: rows.map((raw) => this.toEntity(raw as JournalEntryWithLines)),
      total,
    };
  }

  private toEntity(raw: JournalEntryWithLines): JournalEntry {
    const lines = raw.lines.map((line) => new JournalLine(line));
    return new JournalEntry(raw, lines);
  }
}
