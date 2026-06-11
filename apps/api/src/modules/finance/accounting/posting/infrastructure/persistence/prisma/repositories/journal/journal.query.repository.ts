import { Injectable } from '@nestjs/common';
import { JournalEntryStatus, Prisma } from '@prisma/client';
import { Pagination } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import {
  FindJournalEntriesFilter,
  IJournalQueryRepository,
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

  private toEntity(raw: JournalEntryWithLines): JournalEntry {
    const lines = raw.lines.map((line) => new JournalLine(line));
    return new JournalEntry(raw, lines);
  }
}
