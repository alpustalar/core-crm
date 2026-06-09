import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrganizationInfoCommand } from './update-organization-info.command';
import { UpdateOrganizationInfoCommandResponse } from './update-organization-info.response';
import { Inject, NotFoundException } from '@nestjs/common';
import { FindQuery } from '@modules/organization/organization/application/queries/find/find.query';
import {
  IOrganizationCommandRepository,
  ORGANIZATION_COMMAND_REPOSITORY,
} from '@modules/organization/organization/domain/repositories/organization.repository.interface';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

@CommandHandler(UpdateOrganizationInfoCommand)
export class UpdateOrganizationInfoHandler
  implements
    ICommandHandler<
      UpdateOrganizationInfoCommand,
      UpdateOrganizationInfoCommandResponse
    >
{
  constructor(
    private readonly queryBus: TSQueryBus,
    @Inject(ORGANIZATION_COMMAND_REPOSITORY)
    private readonly orgRepo: IOrganizationCommandRepository
  ) {}

  async execute(
    command: UpdateOrganizationInfoCommand
  ): Promise<UpdateOrganizationInfoCommandResponse> {
    const { dto, organizationId, ctx } = command;
    const { data: org } = await this.queryBus.execute(
      new FindQuery(ctx, organizationId)
    );

    if (!org) throw new NotFoundException('organizasyon bulunamadı');

    org.updateInfo(dto);
    await this.orgRepo.save(org);

    return { id: org.id };
  }
}
