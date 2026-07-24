import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { RegisterUserOrProviderAccount } from '@shared';
import { RegisterOrganizationAccountCommand } from './register-organization-account.command';
import { RegisterOrganizationAccountCommandResponse } from './register-organization-account.response';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { ROLE_SLUGS } from '@src/domain/constants/db/role/role-slugs';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { CreateOrganizationCommand } from '@modules/organization/organization/application/commands/create-organization/create-organization.command';
import { GetRoleBySlugQuery } from '@modules/identity/role/application/queries/get-role-by-slug/get-role-by-slug.query';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { RegisterUserOrProviderAccountCommand } from '@modules/identity/auth/registration/application/commands/register-user-or-provider-account';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { CreateClinicCommand } from '@modules/organization/clinic/application/commands/create-clinic/create-clinic.command';
import { RegistrationConfigurationException } from '@modules/identity/auth/registration/domain/registration.exceptions';

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
    const { data } = command.payload;
    const {
      organization: createOrganizationData,
      clinic: createClinicData,
      owner: ownerData,
    } = data;

    const { data: role } = await this.queryBus.execute(
      new GetRoleBySlugQuery(ROLE_SLUGS.CLINIC_OWNER)
    );

    if (!role) {
      throw new RegistrationConfigurationException('Rol bulunamadı');
    }

    const generatedOrganizationUUID = UUID.generate();
    const generatedClinicUUID = UUID.generate();

    const createUserData: RegisterUserOrProviderAccount = {
      roleId: role.id,
      clinicId: generatedClinicUUID.value,
      organizationId: generatedOrganizationUUID.value,
      displayName: ownerData.displayName,
      email: ownerData.email,
      password: ownerData.password,
      picture: ownerData.picture,
      providerProfile: ownerData.providerProfile,
    };

    await this.transactionManager.run(async () => {
      await this.commandBus.execute(
        new CreateOrganizationCommand({
          data: createOrganizationData,
          ctx: this.internalCtx,
          internalRelations: {
            id: generatedOrganizationUUID.value,
          },
        })
      );

      await this.commandBus.execute(
        new CreateClinicCommand({
          ctx: this.internalCtx,
          data: createClinicData,
          internalRelations: {
            organizationId: generatedOrganizationUUID.value,
            clinicId: generatedClinicUUID.value,
          },
        })
      );

      await this.commandBus.execute(
        new RegisterUserOrProviderAccountCommand({
          data: createUserData,
          ctx: this.internalCtx,
          internalRelations: {
            ownedOrganizationIds: [generatedOrganizationUUID.value],
            managedClinicIds: [generatedClinicUUID.value],
          },
        })
      );
    });
  }
}
