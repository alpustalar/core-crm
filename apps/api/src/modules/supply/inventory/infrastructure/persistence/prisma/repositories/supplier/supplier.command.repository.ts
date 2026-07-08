import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ISupplierCommandRepository } from '@modules/supply/inventory/domain/repositories/supplier.repository.interface';
import { Supplier } from '@modules/supply/inventory/domain/entities/supplier.entity';

@Injectable()
export class SupplierCommandRepository
  extends BaseCommandRepository<Supplier>
  implements ISupplierCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(supplier: Supplier): Promise<Supplier> {
    const data = supplier.toPersistence();

    const raw = await this.db.supplier.create({
      data,
    });

    supplier.flushEvents();

    return new Supplier(raw);
  }

  async findById(id: string): Promise<Supplier | null> {
    const raw = await this.db.supplier.findUnique({ where: { id } });
    return raw ? new Supplier(raw) : null;
  }

  async save(supplier: Supplier): Promise<Supplier> {
    const data = supplier.toPersistence();

    const raw = await this.db.supplier.update({
      where: { id: data.id },
      data,
    });

    supplier.flushEvents();
    return new Supplier(raw);
  }
}
