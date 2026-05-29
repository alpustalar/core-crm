import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { UpdateSupplierCommand } from './update-supplier.command';
import {
  SUPPLIER_COMMAND_REPOSITORY,
  SUPPLIER_QUERY_REPOSITORY,
  ISupplierCommandRepository,
  ISupplierQueryRepository,
} from '@modules/inventory/domain/repositories/supplier.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(UpdateSupplierCommand)
export class UpdateSupplierHandler implements ICommandHandler<UpdateSupplierCommand, void> {
  constructor(
    @Inject(SUPPLIER_QUERY_REPOSITORY)
    private readonly supplierQueryRepo: ISupplierQueryRepository,
    @Inject(SUPPLIER_COMMAND_REPOSITORY)
    private readonly supplierCommandRepo: ISupplierCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: UpdateSupplierCommand): Promise<void> {
    const { supplierId, dto, ctx } = command;
    const { actor } = ctx;

    const { policy } = this.policyFactory.organization(actor);
    if (!policy.isSystemAdmin() && !policy.isOwnOrganization(actor.organizationId)) {
      throw new ForbiddenException('Tedarikçi güncelleme yetkiniz yok.');
    }

    const supplier = await this.supplierQueryRepo.findById(supplierId);
    if (!supplier) throw new NotFoundException('Tedarikçi bulunamadı.');

    supplier.update(dto);

    await this.txManager.run(async () => {
      await this.supplierCommandRepo.save(supplier);
    });
  }
}
