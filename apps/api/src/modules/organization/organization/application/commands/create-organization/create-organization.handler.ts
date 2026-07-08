import { randomUUID } from 'crypto';
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

// REGISTER İŞLEMLERİ BURADAN YAPILMIYOR. BU SADECE CREATE HANDLERI.

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
    const { dto, ctx, internalRelations } = command;
    const { source, actor } = ctx;

    if (ExecutionPolicy.isSystemInitiated(source)) {
      if (!internalRelations?.id) {
        throw new Error('internal işlemlerde id gerekli.');
      }
    } else {
      this.policyFactory
        .user(actor)
        .evaluator.check(
          (p) => p.isSystemAdmin(),
          'Admin yetkisine sahip olmalısınız.'
        );
    }

    const id = internalRelations?.id ?? randomUUID();
    const org = Organization.create({ ...dto, id });
    const saved = await this.orgRepository.save(org);
    return saved.id;
  }
}
