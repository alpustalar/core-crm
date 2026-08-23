import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateSupplierCommand } from './create-supplier.command';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { Supplier } from '@modules/supply/inventory/domain/entities/supplier.entity';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  ITenantScopeResolver,
  TENANT_SCOPE_RESOLVER,
} from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import {
  ISupplierCommandRepository,
  SUPPLIER_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/supplier/supplier.command.repository';

@CommandHandler(CreateSupplierCommand)
export class CreateSupplierHandler implements ICommandHandler<
  CreateSupplierCommand,
  string
> {
  constructor(
    @Inject(SUPPLIER_COMMAND_REPOSITORY)
    private readonly supplierRepo: ISupplierCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateSupplierCommand): Promise<string> {
    const { data, ctx } = command;

    // Kiracı kimliği istekten alınmaz, klinikten türetilir — DTO'da böyle bir
    // alan yok (bkz. CreateSupplierSchema).
    const organizationId = await this.tenantScopeResolver.resolve(data);

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) =>
        p.actorCanAccessClinicOrOwnsOrganization(data.clinicId, organizationId)
      )
      .orThrow();

    const supplier = Supplier.create({
      name: data.name,
      contactName: data.contactName ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      address: data.address ?? null,
      taxNumber: data.taxNumber ?? null,
      taxOffice: data.taxOffice ?? null,
      organizationId,
      clinicId: data.clinicId,
    });

    return this.txManager.run(async () => {
      const saved = await this.supplierRepo.create(supplier);
      return saved.id.value;
    });
  }
}
