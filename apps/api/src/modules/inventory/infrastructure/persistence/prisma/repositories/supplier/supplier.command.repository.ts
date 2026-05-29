import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ISupplierCommandRepository } from '@modules/inventory/domain/repositories/supplier.repository.interface';
import { Supplier } from '@modules/inventory/domain/entities/supplier.entity';
import { CreateSupplierProps } from '@modules/inventory/domain/types/create-supplier.props';

@Injectable()
export class SupplierCommandRepository extends BaseRepository implements ISupplierCommandRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(props: CreateSupplierProps): Promise<Supplier> {
    const raw = await this.db.supplier.create({
      data: {
        id: props.id,
        name: props.name,
        contactName: props.contactName ?? null,
        phone: props.phone ?? null,
        email: props.email ?? null,
        address: props.address ?? null,
        taxNumber: props.taxNumber ?? null,
        taxOffice: props.taxOffice ?? null,
        organizationId: props.organizationId,
      },
    });
    return new Supplier(raw);
  }

  async save(supplier: Supplier): Promise<Supplier> {
    const raw = await this.db.supplier.update({
      where: { id: supplier.id },
      data: { ...supplier.toPersistence(), updatedAt: new Date() },
    });
    return new Supplier(raw);
  }
}
