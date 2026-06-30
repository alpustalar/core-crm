import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrganizationInfoCommand } from './update-organization-info.command';
import { UpdateOrganizationInfoCommandResponse } from './update-organization-info.response';
import { Inject } from '@nestjs/common';
import {
  IOrganizationCommandRepository,
  IOrganizationQueryRepository,
  ORGANIZATION_COMMAND_REPOSITORY,
  ORGANIZATION_QUERY_REPOSITORY,
} from '@modules/organization/organization/domain/repositories/organization.repository.interface';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { OrganizationNotFoundException } from '@modules/organization/organization/domain/exceptions/organization.exceptions';

@CommandHandler(UpdateOrganizationInfoCommand)
export class UpdateOrganizationInfoHandler
  implements
    ICommandHandler<
      UpdateOrganizationInfoCommand,
      UpdateOrganizationInfoCommandResponse
    >
{
  constructor(
    private readonly commandBus: TSQueryBus,
    @Inject(ORGANIZATION_QUERY_REPOSITORY)
    private readonly orgQueryRepo: IOrganizationQueryRepository,
    @Inject(ORGANIZATION_COMMAND_REPOSITORY)
    private readonly orgCommandRepo: IOrganizationCommandRepository
  ) {}

  async execute(
    command: UpdateOrganizationInfoCommand
  ): Promise<UpdateOrganizationInfoCommandResponse> {
    const { dto, organizationId, ctx } = command;

    // TODO: policy kontrol yapılacak

    if (!organizationId)
      throw new OrganizationNotFoundException(organizationId);

    const organization = await this.orgQueryRepo.findById(organizationId);

    if (!organization) throw new OrganizationNotFoundException(organizationId);

    organization.updateInfo(dto);

    const saved = await this.orgCommandRepo.save(organization);

    return saved.id;
  }
}
