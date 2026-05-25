import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrganizationInfoCommand } from './update-organization-info.command';
import { UpdateOrganizationInfoCommandResponse } from './update-organization-info.response';
import { Inject, NotFoundException } from '@nestjs/common';
import { FindQuery } from '@modules/organization/application/queries/find/find.query';
import {
  IOrganizationCommandRepository,
  ORGANIZATION_COMMAND_REPOSITORY,
} from '@modules/organization/domain/repositories/organization.repository.interface';
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

    if (!org) {
      throw new NotFoundException('organizasyon bulunamadı');
    }

    await this.orgRepo.updateByOwner(org.id, dto);

    return {
      id: org.id,
    };
  }
}
