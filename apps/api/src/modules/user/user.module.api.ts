// user-module.api.ts
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { SoftDeleteManyUsersByClinicIdCommand } from '@modules/user/application/commands/soft-delete-many-user-by-clinic-id/soft-delete-many-users-by-clinic-id.command';
import { SoftDeleteManyUserByOrganizationIdCommand } from '@modules/user/application/commands/soft-delete-many-user-by-organization-id/soft-delete-many-users-by-organization-id.command';
import { FindUserForAuthQuery } from '@modules/user/application/queries/find-user-for-auth/find-user-for-auth.query';
import { IUserModuleApi } from '@modules/user/domain/interfaces/user.module.api.interface';
import { UpdateLastLoginCommand } from '@modules/user/application/commands/update-last-login/update-last-login.command';
import { AuthUserResponse } from '@modules/user/domain/types/auth-user-response.type';
import { CreateUser } from '@shared';
import { CreateUserCommand } from '@modules/user/application/commands/create-user/create-user.command';
import { CreateUserInternalRelations } from '@modules/user/domain/types/create-user-internal-relations.type';

@Injectable()
export class UserModuleApi implements IUserModuleApi {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  softDeleteManyWithAClinicId(clinicId: string, context?: IGetContext) {
    const internalContext = ExecutionContextFactory.createInternal(
      ExecutionSources.INTERNAL_CASCADE,
      context
    );
    return this.commandBus.execute(
      new SoftDeleteManyUsersByClinicIdCommand(clinicId, internalContext)
    );
  }

  softDeleteManyWithAnOrganizationId(
    organizationId: string,
    context?: IGetContext
  ) {
    const internalContext = ExecutionContextFactory.createInternal(
      ExecutionSources.INTERNAL_CASCADE,
      context
    );

    return this.commandBus.execute(
      new SoftDeleteManyUserByOrganizationIdCommand(
        organizationId,
        internalContext
      )
    );
  }

  findUserForAuth(firebaseUid: string): Promise<AuthUserResponse | null> {
    return this.queryBus.execute(new FindUserForAuthQuery(firebaseUid));
  }

  updateLastLogin(userId: string) {
    return this.queryBus.execute(new UpdateLastLoginCommand(userId));
  }

  create(
    dto: CreateUser,
    context: IGetContext,
    internalRelations?: CreateUserInternalRelations
  ): Promise<string> {
    const internalContext = ExecutionContextFactory.createInternal(
      ExecutionSources.INTERNAL_CASCADE,
      context
    );
    return this.commandBus.execute(
      new CreateUserCommand(dto, internalContext, internalRelations)
    );
  }
}
