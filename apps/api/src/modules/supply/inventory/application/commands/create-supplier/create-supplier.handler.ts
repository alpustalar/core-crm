import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject } from '@nestjs/common';
import { CreateSupplierCommand } from './create-supplier.command';
import {
  ISupplierCommandRepository,
  SUPPLIER_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/supplier.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(CreateSupplierCommand)
export class CreateSupplierHandler
  implements ICommandHandler<CreateSupplierCommand, string>
{
  constructor(
    @Inject(SUPPLIER_COMMAND_REPOSITORY)
    private readonly supplierCommandRepo: ISupplierCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateSupplierCommand): Promise<string> {
    const { dto, ctx } = command;
    const { actor } = ctx;

    const { policy } = this.policyFactory.organization(actor);
    if (
      !policy.isSystemAdmin() &&
      !policy.isOwnOrganization(actor.organizationId)
    ) {
      throw new ForbiddenException('Tedarikçi oluşturma yetkiniz yok.');
    }

    return this.txManager.run(async () => {
      const supplier = await this.supplierCommandRepo.create({
        id: crypto.randomUUID(),
        name: dto.name,
        contactName: dto.contactName ?? null,
        phone: dto.phone ?? null,
        email: dto.email ?? null,
        address: dto.address ?? null,
        taxNumber: dto.taxNumber ?? null,
        taxOffice: dto.taxOffice ?? null,
        organizationId: actor.organizationId!,
      });
      return supplier.id;
    });
  }
}
