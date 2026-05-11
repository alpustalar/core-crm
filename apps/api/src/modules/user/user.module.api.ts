// user-module.api.ts
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { SoftDeleteManyUsersByClinicIdCommand } from '@modules/user/application/commands/soft-delete-many-user-by-clinic-id/soft-delete-many-users-by-clinic-id.command';
import { SoftDeleteManyUserByOrganizationIdCommand } from '@modules/user/application/commands/soft-delete-many-user-by-organization-id/soft-delete-many-users-by-organization-id.command';

@Injectable()
export class UserModuleApi {
  constructor(private readonly commandBus: CommandBus) {}

  async softDeleteManyWithAClinicId(clinicId: string, context?: IGetContext) {
    const internalContext = ExecutionContextFactory.createInternal(
      ExecutionSources.INTERNAL_CASCADE,
      context
    );
    return await this.commandBus.execute(
      new SoftDeleteManyUsersByClinicIdCommand(clinicId, internalContext)
    );
  }

  async softDeleteManyWithAnOrganizationId(
    organizationId: string,
    context?: IGetContext
  ) {
    const internalContext = ExecutionContextFactory.createInternal(
      ExecutionSources.INTERNAL_CASCADE,
      context
    );

    return await this.commandBus.execute(
      new SoftDeleteManyUserByOrganizationIdCommand(
        organizationId,
        internalContext
      )
    );
  }
}
