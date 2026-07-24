import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ICashSessionCommandRepository } from '@modules/finance/cash-register/domain/repositories/cash-session.repository';
import { CashSession } from '@modules/finance/cash-register/domain/entities/cash-session.entity';
import { CashSession as ICashSession } from '@model-schema/CashSessionSchema';
import { CashSessionStatusSchema } from '@input-type-schemas/CashSessionStatusSchema';
import {
  CashBridgeTotals,
  CashMovementTotals,
} from '@modules/finance/cash-register/domain/contracts/cash-register.contracts';

@Injectable()
export class CashSessionCommandRepository
  extends BaseCommandRepository<CashSession>
  implements ICashSessionCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: CashSession): Promise<CashSession> {
    const raw = await this.db.cashSession.create({
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new CashSession(raw);
  }

  async save(entity: CashSession): Promise<CashSession> {
    const { id, ...update } = entity.toPersistence();
    const raw = await this.db.cashSession.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new CashSession(raw);
  }

  async findById(id: string): Promise<CashSession | null> {
    const raw = await this.db.cashSession.findUnique({ where: { id } });
    return raw ? new CashSession(raw) : null;
  }

  async findByIdForUpdate(id: string): Promise<CashSession | null> {
    await this.lockRowForUpdate('cash_sessions', id);
    const raw = await this.db.cashSession.findUnique({ where: { id } });
    return raw ? new CashSession(raw) : null;
  }

  findOpenByRegister(cashRegisterId: string): Promise<ICashSession | null> {
    return this.db.cashSession.findFirst({
      where: {
        cashRegisterId,
        status: CashSessionStatusSchema.enum.OPEN,
      },
    });
  }

  async sumMovements(cashSessionId: string): Promise<CashMovementTotals> {
    const [inAgg, outAgg] = await Promise.all([
      this.db.cashMovement.aggregate({
        where: { cashSessionId, direction: 'IN' },
        _sum: { amount: true },
      }),
      this.db.cashMovement.aggregate({
        where: { cashSessionId, direction: 'OUT' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalIn: new Decimal((inAgg._sum.amount ?? 0).toString()),
      totalOut: new Decimal((outAgg._sum.amount ?? 0).toString()),
    };
  }

  async sumBridgeMovements(cashSessionId: string): Promise<CashBridgeTotals> {
    const [bankDepositAgg, expenseAgg] = await Promise.all([
      this.db.cashMovement.aggregate({
        where: { cashSessionId, type: 'BANK_DEPOSIT' },
        _sum: { amount: true },
      }),
      this.db.cashMovement.aggregate({
        where: { cashSessionId, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
    ]);

    return {
      bankDepositTotal: new Decimal(
        (bankDepositAgg._sum.amount ?? 0).toString()
      ),
      expenseTotal: new Decimal((expenseAgg._sum.amount ?? 0).toString()),
    };
  }
}
