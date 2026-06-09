import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ISupplierCommandRepository } from '@modules/supply/inventory/domain/repositories/supplier.repository.interface';
import { Supplier } from '@modules/supply/inventory/domain/entities/supplier.entity';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class SupplierCommandRepository
  extends BaseCommandRepository<Supplier>
  implements ISupplierCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(supplier: Supplier): Promise<Supplier> {
    const data = supplier.toPersistence();

    const raw = await this.db.supplier.upsert({
      where: { id: supplier.id },
      create: data,
      update: data,
    });

    supplier.flushEvents();
    return new Supplier(raw);
  }

  async saveMany(suppliers: Supplier[]): Promise<void> {
    const prismaQueries = suppliers.map((supplier) => {
      const data = supplier.toPersistence();
      return this.db.supplier.upsert({
        where: { id: supplier.id },
        create: data,
        update: data,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(prismaQueries);
    } else {
      await this.prisma.$transaction(prismaQueries);
    }

    suppliers.forEach((supplier) => supplier.flushEvents());
  }
}
