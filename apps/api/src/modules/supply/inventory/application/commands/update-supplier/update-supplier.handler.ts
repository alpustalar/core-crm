import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateSupplierCommand } from './update-supplier.command';
import {
  ISupplierCommandRepository,
  SUPPLIER_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/supplier.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { SupplierNotFoundException } from '@modules/supply/inventory/domain/exceptions/inventory.exceptions';

@CommandHandler(UpdateSupplierCommand)
export class UpdateSupplierHandler
  implements ICommandHandler<UpdateSupplierCommand, void>
{
  constructor(
    @Inject(SUPPLIER_COMMAND_REPOSITORY)
    private readonly supplierCommandRepo: ISupplierCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: UpdateSupplierCommand): Promise<void> {
    const { supplierId, dto, ctx } = command;
    const { actor } = ctx;

    if (!supplierId) throw new SupplierNotFoundException(supplierId);

    const supplier = await this.supplierCommandRepo.findById(supplierId);

    if (!supplier) throw new SupplierNotFoundException(supplierId);

    // TODO: supplier'ın organizationId'sine göre policy işlemi yapılacak. orgaizationPolicy'e actorCanAccessOrganzation gibi bi method yazılacak

    supplier.update(dto);

    await this.txManager.run(async () => {
      await this.supplierCommandRepo.save(supplier);
    });
  }
}
