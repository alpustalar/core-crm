import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { JournalEntryUniqueConstraintException } from '@modules/finance/accounting/posting/domain/exceptions/journal-entry-unique-constraint.exception';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IJournalCommandRepository } from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { JournalEntry } from '@modules/finance/accounting/posting/domain/entities/journal-entry.entity';
import { JournalLine } from '@modules/finance/accounting/posting/domain/entities/journal-line.entity';

type JournalEntryWithLines = Prisma.JournalEntryGetPayload<{
  include: { lines: true };
}>;

@Injectable()
export class JournalCommandRepository
  extends BaseRepository
  implements IJournalCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(entry: JournalEntry): Promise<JournalEntry> {
    const data = entry.toPersistence();
    const lines = entry.linesToPersistence();

    try {
      const raw = await this.db.journalEntry.create({
        data: {
          ...data,
          lines: {
            create: lines.map((line) => ({
              id: line.id,
              accountId: line.accountId,
              partyId: line.partyId,
              debit: line.debit,
              credit: line.credit,
              currency: line.currency,
              lineDesc: line.lineDesc,
            })),
          },
        },
        include: { lines: true },
      });

      entry.flushEvents();
      return this.toEntity(raw);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new JournalEntryUniqueConstraintException();
      }
      throw error;
    }
  }

  async applyReversal(entry: JournalEntry): Promise<void> {
    const data = entry.toPersistence();
    await this.db.journalEntry.update({
      where: { id: data.id },
      data: {
        status: data.status,
        reversedById: data.reversedById,
        updatedAt: new Date(),
      },
    });
  }

  async nextEntryNo(clinicId: string, periodId: string): Promise<bigint> {
    const result = await this.db.journalEntry.aggregate({
      where: { clinicId, periodId, entryNo: { not: null } },
      _max: { entryNo: true },
    });
    return (result._max.entryNo ?? 0n) + 1n;
  }

  private toEntity(raw: JournalEntryWithLines): JournalEntry {
    const lines = raw.lines.map((line) => new JournalLine(line));
    return new JournalEntry(raw, lines);
  }
}
