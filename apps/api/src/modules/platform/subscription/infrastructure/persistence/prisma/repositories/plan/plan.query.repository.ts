import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { Plan } from '@modules/platform/subscription/domain/entities/plan.entity';
import { IPlanQueryRepository } from '@modules/platform/subscription/domain/repositories/plan.repository.interface';
import { PlanReadModel } from '@modules/platform/subscription/domain/subscription.contracts';
import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';

const modulesInclude = {
  modules: { include: { module: true } },
} satisfies Prisma.PlanInclude;

type PlanWithModulesRaw = Prisma.PlanGetPayload<{
  include: typeof modulesInclude;
}>;

@Injectable()
export class PlanQueryRepository
  extends BaseRepository
  implements IPlanQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByPlanId(planId: PlanId): Promise<Plan | null> {
    const raw = await this.db.plan.findUnique({ where: { planId } });
    return raw ? new Plan(raw) : null;
  }

  async findAllActiveWithModules(): Promise<PlanReadModel[]> {
    const rows = await this.db.plan.findMany({
      where: { isActive: true },
      include: modulesInclude,
      orderBy: { monthlyPrice: 'asc' },
    });
    return rows.map((r) => this.toReadModel(r));
  }

  async findByPlanIdWithModules(planId: PlanId): Promise<PlanReadModel | null> {
    const raw = await this.db.plan.findUnique({
      where: { planId },
      include: modulesInclude,
    });
    return raw ? this.toReadModel(raw) : null;
  }

  private toReadModel(raw: PlanWithModulesRaw): PlanReadModel {
    return {
      id: raw.id,
      planId: raw.planId,
      name: raw.name,
      monthlyPrice: raw.monthlyPrice,
      currency: raw.currency,
      isActive: raw.isActive,
      modules: raw.modules.map((pm) => ({
        id: pm.module.id,
        key: pm.module.key,
        name: pm.module.name,
      })),
    };
  }
}
