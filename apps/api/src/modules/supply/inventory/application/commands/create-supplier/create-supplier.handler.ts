import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateSupplierCommand } from './create-supplier.command';
import {
  ISupplierCommandRepository,
  SUPPLIER_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/supplier.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { Supplier } from '@modules/supply/inventory/domain/entities/supplier.entity';
import { OrganizationNotAssignedException } from '@src/domain/exceptions/organization-not-assigned.exception';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

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

    if (!actor.organizationId) throw new OrganizationNotAssignedException();

    this.policyFactory
      .clinic(actor)
      .evaluator.systemBypass(ctx.source)
      .check((p) => p.actorCanAccessTargetClinic(dto.clinicId))
      .orThrow();

    const supplier = Supplier.create({
      name: dto.name,
      contactName: dto.contactName ?? null,
      phone: dto.phone ?? null,
      email: dto.email ?? null,
      address: dto.address ?? null,
      taxNumber: dto.taxNumber ?? null,
      taxOffice: dto.taxOffice ?? null,
      organizationId: actor.organizationId,
      clinicId: dto.clinicId,
    });

    return this.txManager.run(async () => {
      const saved = await this.supplierCommandRepo.create(supplier);
      return saved.id.value;
    });
  }
}
