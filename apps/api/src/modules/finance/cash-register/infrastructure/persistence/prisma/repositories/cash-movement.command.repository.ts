import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ICashMovementCommandRepository } from '@modules/finance/cash-register/domain/repositories/cash-movement.repository';
import { CashMovement } from '@modules/finance/cash-register/domain/entities/cash-movement.entity';

@Injectable()
export class CashMovementCommandRepository
  extends BaseCommandRepository<CashMovement>
  implements ICashMovementCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: CashMovement): Promise<CashMovement> {
    const raw = await this.db.cashMovement.create({
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new CashMovement(raw);
  }

  async save(entity: CashMovement): Promise<CashMovement> {
    const { id, ...update } = entity.toPersistence();
    const raw = await this.db.cashMovement.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new CashMovement(raw);
  }

  async findById(id: string): Promise<CashMovement | null> {
    const raw = await this.db.cashMovement.findUnique({ where: { id } });
    return raw ? new CashMovement(raw) : null;
  }
}
