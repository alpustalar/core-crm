import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrganizationCommand } from './create-organization.command';
import {
  IOrganizationRepository,
  ORGANIZATION_REPO_TOKEN,
} from '@modules/organization/domain/repositories/organization.repository.interface';
import { ForbiddenException, Inject } from '@nestjs/common';
import { slugIt } from '@common/utils';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { CreateOrganizationResponse } from '@modules/organization/application/commands/create-organization/create-organization.response';
import {
  IPolicyFactory,
  POLICY_FACTORY_TOKEN,
} from '@modules/policy/domain/interfaces/policy-factory.interface';

@CommandHandler(CreateOrganizationCommand)
export class CreateOrganizationHandler
  implements
    ICommandHandler<CreateOrganizationCommand, CreateOrganizationResponse>
{
  constructor(
    @Inject(ORGANIZATION_REPO_TOKEN)
    private orgRepository: IOrganizationRepository,
    @Inject(POLICY_FACTORY_TOKEN)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    command: CreateOrganizationCommand
  ): Promise<CreateOrganizationResponse> {
    const { dto, context } = command;
    const slug = slugIt(dto.name);
    const { source } = context;

    if (ExecutionPolicy.isSystemInitiated(source)) {
      const organizationRaw = await this.orgRepository.create({ ...dto, slug });
      return { id: organizationRaw.id };
    }

    const { policy } = this.policyFactory.user(context.actor);

    if (policy.isSystemAdmin()) {
      const organizationRaw = await this.orgRepository.create({ ...dto, slug });
      return { id: organizationRaw.id };
    }

    throw new ForbiddenException();
  }
}
