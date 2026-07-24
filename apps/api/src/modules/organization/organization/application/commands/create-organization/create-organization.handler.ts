import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrganizationCommand } from './create-organization.command';
import {
  IOrganizationCommandRepository,
  ORGANIZATION_COMMAND_REPOSITORY,
} from '@modules/organization/organization/domain/repositories/organization.repository.interface';
import { Inject } from '@nestjs/common';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { CreateOrganizationResponse } from '@modules/organization/organization/application/commands/create-organization/create-organization.response';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { Organization } from '@modules/organization/organization/domain/entities/organization.entity';
import { UUID } from '@src/domain/value-objects/uuid.vo';

// REGISTER İŞLEMLERİ BURADAN YAPILMAZ

@CommandHandler(CreateOrganizationCommand)
export class CreateOrganizationHandler
  implements
    ICommandHandler<CreateOrganizationCommand, CreateOrganizationResponse>
{
  constructor(
    @Inject(ORGANIZATION_COMMAND_REPOSITORY)
    private orgRepository: IOrganizationCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    command: CreateOrganizationCommand
  ): Promise<CreateOrganizationResponse> {
    const { data, ctx, internalRelations } = command.payload;
    const { source, actor } = ctx;

    if (ExecutionPolicy.isSystemInitiated(source)) {
      if (!internalRelations?.id) {
        throw new Error('internal işlemlerde id gerekli.');
      }
    } else {
      this.policyFactory
        .user(actor, source)
        .evaluator.check(
          (p) => p.isSystemAdmin(),
          'Admin yetkisine sahip olmalısınız.'
        )
        .orThrow();
    }

    const id = internalRelations?.id ?? UUID.generate().value;
    const org = Organization.create({ ...data, id });
    const saved = await this.orgRepository.create(org);
    return saved.id.value;
  }
}
