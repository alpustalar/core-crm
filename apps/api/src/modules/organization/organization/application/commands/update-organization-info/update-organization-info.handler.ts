import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrganizationInfoCommand } from './update-organization-info.command';
import { UpdateOrganizationInfoCommandResponse } from './update-organization-info.response';
import { Inject } from '@nestjs/common';
import { OrganizationNotFoundException } from '@modules/organization/organization/domain/exceptions/organization.exceptions';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { ORGANIZATION_EVENTS } from '@src/domain/constants/events';
import {
  IOrganizationCommandRepository,
  ORGANIZATION_COMMAND_REPOSITORY,
} from '@modules/organization/organization/domain/repositories/organization/organization.command.repository';

@CommandHandler(UpdateOrganizationInfoCommand)
export class UpdateOrganizationInfoHandler
  implements
    ICommandHandler<
      UpdateOrganizationInfoCommand,
      UpdateOrganizationInfoCommandResponse
    >
{
  constructor(
    @Inject(ORGANIZATION_COMMAND_REPOSITORY)
    private readonly organizationRepo: IOrganizationCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    command: UpdateOrganizationInfoCommand
  ): Promise<UpdateOrganizationInfoCommandResponse> {
    const { data, organizationId, ctx } = command.payload;

    const organization = await this.organizationRepo.findById(organizationId);

    if (!organization) throw new OrganizationNotFoundException(organizationId);

    this.policyFactory
      .organization(ctx.actor, ctx.source)
      .evaluator.check((p) =>
        p.actorCanAccessTargetOrganization(organization.id.value)
      )
      .orThrow(ORGANIZATION_EVENTS.UPDATED);

    organization.updateInfo(data);

    const saved = await this.organizationRepo.update(organization);

    return saved.id.value;
  }
}
