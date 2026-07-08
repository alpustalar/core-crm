import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { CreateUser } from '@shared';
import { RegisterClinicAccountCommand } from './register-clinic-account.command';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { ROLE_SLUGS } from '@src/domain/constants/db/role/role-slugs';
import { RegisterClinicAccountResponse } from '@modules/identity/auth/registration/application/commands/register-clinic-account/register-clinic-account.response';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { CreateUserCommand } from '@modules/identity/user/application/commands/create-user';
import { GetRoleBySlugQuery } from '@modules/identity/role/application/queries/get-role-by-slug/get-role-by-slug.query';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { CreateOrganizationCommand } from '@modules/organization/organization/application/commands/create-organization/create-organization.command';
import { CreateClinicCommand } from '@modules/organization/clinic/application/commands/create-clinic/create-clinic.command';
import { InitializeChartOfAccountsCommand } from '@modules/finance/accounting/chart-of-accounts/application/commands/initialize-chart-of-accounts/initialize-chart-of-accounts.command';
import { OpenPeriodCommand } from '@modules/finance/accounting/periods/application/commands/open-period/open-period.command';
import { InitializeTaxParametersCommand } from '@modules/finance/accounting/tax-parameters/application/commands/initialize-tax-parameters/initialize-tax-parameters.command';
import { DateTimeManager } from '@common/utils';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { CreateOrganization } from '@shared/modules/organization/types';
import { RegistrationConfigurationException } from '@modules/identity/auth/registration/domain/registration.exceptions';

@CommandHandler(RegisterClinicAccountCommand)
export class RegisterClinicAccountHandler
  implements
    ICommandHandler<
      RegisterClinicAccountCommand,
      RegisterClinicAccountResponse
    >
{
  private readonly internalCtx = ExecutionContextFactory.createInternal();
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(
    command: RegisterClinicAccountCommand
  ): Promise<RegisterClinicAccountResponse> {
    const { dto } = command;
    const { clinic: clinicDto, owner: ownerDto } = dto;

    const { data: role } = await this.queryBus.execute(
      new GetRoleBySlugQuery(ROLE_SLUGS.CLINIC_OWNER)
    );

    if (!role) {
      throw new RegistrationConfigurationException('Rol bulunamadı');
    }

    const generatedOrganizationId = UUID.generate().value;
    const generatedClinicId = UUID.generate().value;

    await this.transactionManager.outboxRun(async () => {
      const organizationDto: CreateOrganization = {
        name: clinicDto.name,
        phone: clinicDto.phone,
        email: clinicDto.email,
        address: clinicDto.address,
        city: clinicDto.city,
        district: clinicDto.district,
      };
      await this.commandBus.execute(
        new CreateOrganizationCommand(organizationDto, this.internalCtx, {
          id: generatedOrganizationId,
        })
      );

      await this.commandBus.execute(
        new CreateClinicCommand(clinicDto, this.internalCtx, {
          clinicId: generatedClinicId,
          organizationId: generatedOrganizationId,
        })
      );

      const createUserDto: CreateUser = {
        ...ownerDto,
        roleId: role.id,
        organizationId: generatedOrganizationId,
        clinicId: generatedClinicId,
      };

      await this.commandBus.execute(
        new CreateUserCommand(createUserDto, this.internalCtx, {
          ownedOrganizationIds: [generatedOrganizationId],
          managedClinicIds: [generatedClinicId],
        })
      );

      // Finans muhasebe altyapısı clinic (defter) seviyesinde kurulur: hesap planı
      // (idempotent) + cari yıl dönemi. Posting'in çalışabilmesi için ön koşul.
      await this.commandBus.execute(
        new InitializeChartOfAccountsCommand(
          generatedClinicId,
          generatedOrganizationId,
          this.internalCtx
        )
      );

      await this.commandBus.execute(
        new OpenPeriodCommand(
          generatedClinicId,
          generatedOrganizationId,
          DateTimeManager.currentYear(),
          this.internalCtx
        )
      );

      // Varsayılan vergi parametreleri (KDV/stopaj/kurumlar) — idempotent.
      // Fatura kesimi KDV oranını buradan çözer
      await this.commandBus.execute(
        new InitializeTaxParametersCommand(
          generatedClinicId,
          generatedOrganizationId,
          this.internalCtx
        )
      );
    });
  }
}
