import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateSupplierCommand } from './create-supplier.command';
import {
  ISupplierCommandRepository,
  SUPPLIER_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/supplier.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { Supplier } from '@modules/supply/inventory/domain/entities/supplier.entity';

@CommandHandler(CreateSupplierCommand)
export class CreateSupplierHandler
  implements ICommandHandler<CreateSupplierCommand, string>
{
  constructor(
    @Inject(SUPPLIER_COMMAND_REPOSITORY)
    private readonly supplierCommandRepo: ISupplierCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateSupplierCommand): Promise<string> {
    const { dto, ctx } = command;
    const { actor } = ctx;

    // TODO: capability guard ile kullan + DTO ile clinicId eklensin

    return this.txManager.run(async () => {
      const supplier = Supplier.create({
        name: dto.name,
        contactName: dto.contactName ?? null,
        phone: dto.phone ?? null,
        email: dto.email ?? null,
        address: dto.address ?? null,
        taxNumber: dto.taxNumber ?? null,
        taxOffice: dto.taxOffice ?? null,
        organizationId: actor.organizationId!,
      });
      const saved = await this.supplierCommandRepo.save(supplier);
      return saved.id;
    });
  }
}
