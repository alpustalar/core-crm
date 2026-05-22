import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrganizationCommand } from './create-organization.command';
import {
  IOrganizationCommandRepository,
  ORGANIZATION_COMMAND_REPOSITORY,
} from '@modules/organization/domain/repositories/organization.repository.interface';
import { ForbiddenException, Inject } from '@nestjs/common';
import { slugIt } from '@common/utils';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { CreateOrganizationResponse } from '@modules/organization/application/commands/create-organization/create-organization.response';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/policy/domain/interfaces/policy-factory.interface';

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
    const slug = slugIt(dto.name);
    const { source } = ctx;

    if (ExecutionPolicy.isSystemInitiated(source)) {
      const id = internalRelations?.id;
      if (!id) {
        throw new Error('internal işlemlerde id gerekli');
      }
      await this.orgRepository.create({
        ...dto,
        slug,
        id,
      });
      return id;
    }

    const { policy } = this.policyFactory.user(ctx.actor);

    if (policy.isSystemAdmin()) {
      const organizationRaw = await this.orgRepository.create({ ...dto, slug });
      return organizationRaw.id;
    }

    throw new ForbiddenException();
  }
}
