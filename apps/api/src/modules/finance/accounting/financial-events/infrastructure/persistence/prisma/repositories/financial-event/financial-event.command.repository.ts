import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { FinancialEvent } from '@modules/finance/accounting/financial-events/domain/entities/financial-event.entity';
import { FinancialEventUniqueConstraintException } from '@modules/finance/accounting/financial-events/domain/exceptions/financial-event-unique-constraint.exception';
import { IFinancialEventCommandRepository } from '@modules/finance/accounting/financial-events/domain/repositories/financial-event/financial-event.command.repository';

@Injectable()
export class FinancialEventCommandRepository
  extends BaseRepository
  implements IFinancialEventCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByDedupeKey(dedupeKey: string): Promise<FinancialEvent | null> {
    const raw = await this.db.financialEvent.findUnique({
      where: { dedupeKey },
    });
    return raw ? new FinancialEvent(raw) : null;
  }

  async append(event: FinancialEvent): Promise<FinancialEvent> {
    const data = event.toPersistence();
    try {
      const raw = await this.db.financialEvent.create({
        data: { ...data, payload: data.payload as Prisma.InputJsonValue },
      });
      event.flushEvents();
      return new FinancialEvent(raw);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new FinancialEventUniqueConstraintException();
      }
      throw error;
    }
  }
}
