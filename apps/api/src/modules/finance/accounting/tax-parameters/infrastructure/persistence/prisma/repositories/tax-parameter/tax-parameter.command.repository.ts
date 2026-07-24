import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';
import { ITaxParameterCommandRepository } from '@modules/finance/accounting/tax-parameters/domain/repositories/tax-parameter.repository';
import { TaxParameter } from '@modules/finance/accounting/tax-parameters/domain/entities/tax-parameter.entity';

@Injectable()
export class TaxParameterCommandRepository
  extends BaseCommandRepository<TaxParameter>
  implements ITaxParameterCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<TaxParameter | null> {
    const raw = await this.db.taxParameter.findUnique({ where: { id } });
    return raw ? new TaxParameter(raw) : null;
  }

  async create(entity: TaxParameter): Promise<TaxParameter> {
    const data = entity.toPersistence();
    const raw = await this.db.taxParameter.create({ data });
    entity.flushEvents();
    return new TaxParameter(raw);
  }

  async save(entity: TaxParameter) {
    const data = entity.toPersistence();
    const { id, ...update } = data;
    const raw = await this.db.taxParameter.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new TaxParameter(raw);
  }

  async saveMany(entities: TaxParameter[]): Promise<void> {
    const queries = entities.map((entity) => {
      const data = entity.toPersistence();
      return this.db.taxParameter.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(queries);
    } else {
      await this.prisma.$transaction(queries);
    }

    entities.forEach((entity) => entity.flushEvents());
  }
}
