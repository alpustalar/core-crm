import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { CashRegister } from '@modules/finance/cash-register/domain/entities/cash-register.entity';
import { ICashRegisterCommandRepository } from '@modules/finance/cash-register/domain/repositories/cash-register/cash-register.command.repository';

@Injectable()
export class CashRegisterCommandRepository
  extends BaseCommandRepository<CashRegister>
  implements ICashRegisterCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: CashRegister): Promise<CashRegister> {
    const raw = await this.db.cashRegister.create({
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new CashRegister(raw);
  }

  async update(entity: CashRegister): Promise<CashRegister> {
    const { id, ...update } = entity.toPersistence();
    const raw = await this.db.cashRegister.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new CashRegister(raw);
  }

  async findById(id: string): Promise<CashRegister | null> {
    const raw = await this.db.cashRegister.findUnique({ where: { id } });
    return raw ? new CashRegister(raw) : null;
  }

  async findByIdForUpdate(id: string): Promise<CashRegister | null> {
    await this.lockRowForUpdate('cash_registers', id);
    const raw = await this.db.cashRegister.findUnique({ where: { id } });
    return raw ? new CashRegister(raw) : null;
  }
}
