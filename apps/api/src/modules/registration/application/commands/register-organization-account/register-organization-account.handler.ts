import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { CreateUser } from '@shared';
import { RegisterOrganizationAccountCommand } from './register-organization-account.command';
import { RegisterOrganizationAccountCommandResponse } from './register-organization-account.response';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { ROLE_SLUGS } from '@src/domain/constants/db/role/role-slugs';
import { CreateUserCommand } from '@modules/user/application/commands/create-user';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { CreateOrganizationCommand } from '@modules/organization/application/commands/create-organization/create-organization.command';
import { GetRoleBySlugQuery } from '@modules/role/application/queries/get-role-by-slug/get-role-by-slug.query';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

@CommandHandler(RegisterOrganizationAccountCommand)
export class RegisterOrganizationAccountHandler
  implements
    ICommandHandler<
      RegisterOrganizationAccountCommand,
      RegisterOrganizationAccountCommandResponse
    >
{
  private readonly internalCtx = ExecutionContextFactory.createInternal();
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(
    command: RegisterOrganizationAccountCommand
  ): Promise<RegisterOrganizationAccountCommandResponse> {
    const { dto } = command;
    const { organization: organizationDto, owner: ownerDto } = dto;

    const { data: role } = await this.queryBus.execute(
      new GetRoleBySlugQuery(ROLE_SLUGS.CLINIC_OWNER)
    );

    const organizationId = crypto.randomUUID();

    const userDto: CreateUser = {
      ...ownerDto,
      roleId: role.id,
      organizationId,
    };

    await this.transactionManager.run(async () => {
      await this.commandBus.execute(
        new CreateOrganizationCommand(organizationDto, this.internalCtx, {
          id: organizationId,
        })
      );

      await this.commandBus.execute(
        new CreateUserCommand(userDto, this.internalCtx, {
          ownedOrganizationIds: [organizationId],
        })
      );
    });
  }
}
