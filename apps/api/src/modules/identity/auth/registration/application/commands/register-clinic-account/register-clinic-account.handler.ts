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
import { NotFoundException } from '@nestjs/common';

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

    if (!role?.id) {
      throw new NotFoundException('Rol bulunamadı');
    }

    const roleId = role.id;

    const organizationId = crypto.randomUUID();
    const clinicId = crypto.randomUUID();
    await this.transactionManager.run(async () => {
      const organizationDto = {
        name: clinicDto.name,
        phone: clinicDto.phone,
        email: clinicDto.email,
        address: clinicDto.address,
        city: clinicDto.city,
        district: clinicDto.district,
      };
      await this.commandBus.execute(
        new CreateOrganizationCommand(organizationDto, this.internalCtx, {
          id: organizationId,
        })
      );

      await this.commandBus.execute(
        new CreateClinicCommand(clinicDto, this.internalCtx, {
          clinicId,
          organizationId,
        })
      );

      const userDto: CreateUser = {
        ...ownerDto,
        roleId,
        organizationId,
        clinicId,
      };

      await this.commandBus.execute(
        new CreateUserCommand(userDto, this.internalCtx, {
          ownedOrganizationIds: [organizationId],
          managedClinicIds: [clinicId],
        })
      );

      // Finans muhasebe altyapısı clinic (defter) seviyesinde kurulur: hesap planı
      // (idempotent) + cari yıl dönemi. Posting'in çalışabilmesi için ön koşul.
      await this.commandBus.execute(
        new InitializeChartOfAccountsCommand(
          clinicId,
          organizationId,
          this.internalCtx
        )
      );

      await this.commandBus.execute(
        new OpenPeriodCommand(
          clinicId,
          organizationId,
          DateTimeManager.currentYear(),
          this.internalCtx
        )
      );

      // Varsayılan vergi parametreleri (KDV/stopaj/kurumlar) — idempotent.
      // Fatura kesimi KDV oranını buradan çözer (bkz documents/finans/06-vergi.md).
      await this.commandBus.execute(
        new InitializeTaxParametersCommand(
          clinicId,
          organizationId,
          this.internalCtx
        )
      );
    });
  }
}
