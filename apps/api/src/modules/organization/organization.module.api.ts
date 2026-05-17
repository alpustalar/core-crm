import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateOrganizationDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { CreateOrganizationCommand } from '@modules/organization/application/commands/create-organization/create-organization.command';
import { CreateOrganizationResponse } from '@modules/organization/application/commands/create-organization/create-organization.response';
import { IOrganizationModuleApi } from '@modules/organization/domain/interfaces/organization.module.api.interface';

@Injectable()
export class OrganizationModuleApi implements IOrganizationModuleApi {
  constructor(private readonly commandBus: CommandBus) {}

  create(
    dto: CreateOrganizationDto,
    context?: IGetContext
  ): Promise<CreateOrganizationResponse> {
    const ctx = ExecutionContextFactory.createInternal(context?.source, context);
    return this.commandBus.execute<CreateOrganizationCommand, CreateOrganizationResponse>(
      new CreateOrganizationCommand(dto, ctx)
    );
  }
}
