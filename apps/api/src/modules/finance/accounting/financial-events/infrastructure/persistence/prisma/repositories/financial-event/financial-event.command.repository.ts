import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IFinancialEventCommandRepository } from '@modules/finance/accounting/financial-events/domain/repositories/financial-event.repository';
import { FinancialEvent } from '@modules/finance/accounting/financial-events/domain/entities/financial-event.entity';

@Injectable()
export class FinancialEventCommandRepository
  extends BaseRepository
  implements IFinancialEventCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async append(event: FinancialEvent): Promise<FinancialEvent> {
    const data = event.toPersistence();
    const raw = await this.db.financialEvent.create({
      data: { ...data, payload: data.payload as Prisma.InputJsonValue },
    });
    event.flushEvents();
    return new FinancialEvent(raw);
  }
}
