import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { Plan } from '@modules/platform/subscription/domain/entities/plan.entity';
import { IPlanCommandRepository } from '@modules/platform/subscription/domain/repositories/plan.repository.interface';

@Injectable()
export class PlanCommandRepository
  extends BaseCommandRepository<Plan>
  implements IPlanCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Plan | null> {
    const raw = await this.db.plan.findUnique({ where: { id } });
    return raw ? new Plan(raw) : null;
  }

  async create(entity: Plan): Promise<Plan> {
    const raw = await this.db.plan.create({ data: entity.toPersistence() });
    return new Plan(raw);
  }

  async update(entity: Plan): Promise<Plan> {
    const data = entity.toPersistence();
    const { id: _id, ...update } = data;
    const raw = await this.db.plan.update({
      where: { id: data.id },
      data: update,
    });
    return new Plan(raw);
  }

  async upsertByPlanId(entity: Plan): Promise<Plan> {
    const data = entity.toPersistence();
    const { planId, ...rest } = data;
    const raw = await this.db.plan.upsert({
      where: { planId },
      create: data,
      // planId sabit anahtar — update'te değişmez.
      update: {
        name: rest.name,
        monthlyPrice: rest.monthlyPrice,
        currency: rest.currency,
        isActive: rest.isActive,
      },
    });
    return new Plan(raw);
  }

  async setModules(planRowId: string, moduleIds: string[]): Promise<void> {
    // Bundle'ı tümüyle değiştir (idempotent): mevcut join'leri sil, yenilerini yaz.
    await this.db.planModule.deleteMany({ where: { planRowId } });
    if (moduleIds.length > 0) {
      await this.db.planModule.createMany({
        data: moduleIds.map((moduleId) => ({
          id: randomUUID(),
          planRowId,
          moduleId,
        })),
        skipDuplicates: true,
      });
    }
  }
}
