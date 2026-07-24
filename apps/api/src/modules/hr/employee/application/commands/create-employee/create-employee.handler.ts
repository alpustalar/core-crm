import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateEmployeeCommand } from './create-employee.command';
import {
  EMPLOYEE_COMMAND_REPOSITORY,
  EMPLOYEE_CONTRACT_COMMAND_REPOSITORY,
  IEmployeeCommandRepository,
  IEmployeeContractCommandRepository,
} from '@modules/hr/employee/domain/repositories/employee.repository';
import { Employee } from '@modules/hr/employee/domain/entities/employee.entity';
import { EmployeeContract } from '@modules/hr/employee/domain/entities/employee-contract.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  EMPLOYEE_EVENT_PUBLISHER,
  IEmployeeEventPublisher,
} from '@modules/hr/employee/domain/interfaces/employee-event-publisher.interface';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetClinicOrganizationIdQuery } from '@modules/organization/clinic/application/queries/get-clinic-organization-id/get-clinic-organization-id.query';
import { isDefined } from '@common/utils';
import { EMPLOYEE_EVENTS } from '@src/domain/constants/events/employee.constant';

@CommandHandler(CreateEmployeeCommand)
export class CreateEmployeeHandler implements ICommandHandler<
  CreateEmployeeCommand,
  string
> {
  constructor(
    @Inject(EMPLOYEE_COMMAND_REPOSITORY)
    private readonly employeeCommandRepo: IEmployeeCommandRepository,
    @Inject(EMPLOYEE_CONTRACT_COMMAND_REPOSITORY)
    private readonly contractCommandRepo: IEmployeeContractCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(EMPLOYEE_EVENT_PUBLISHER)
    private readonly eventPublisher: IEmployeeEventPublisher,
    private readonly txManager: TransactionManager,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(command: CreateEmployeeCommand): Promise<string> {
    const { data, ctx } = command;

    const { data: organizationId } = await this.queryBus.execute(
      new GetClinicOrganizationIdQuery(data.clinicId)
    );

    this.policyFactory
      .employee(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canManageClinicHr(data.clinicId))
      .orThrow(EMPLOYEE_EVENTS.CREATE);

    const employee = Employee.create({
      organizationId,
      clinicId: data.clinicId,
      userId: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      nationalId: data.nationalId,
      title: data.title,
      department: data.department,
      employmentType: data.employmentType,
      hireDate: data.hireDate,
      annualLeaveEntitlement: data.annualLeaveEntitlement,
    });

    return this.txManager.run(async () => {
      const saved = await this.employeeCommandRepo.create(employee);

      // Maaş verildiyse başlangıç sözleşmesini de oluştur.
      if (isDefined(data.grossSalary)) {
        const contract = EmployeeContract.create({
          employeeId: saved.id.value,
          type: data.employmentType,
          startDate: data.hireDate,
          grossSalary: data.grossSalary,
          currency: data.currency,
        });
        await this.contractCommandRepo.create(contract);
      }

      this.eventPublisher.employeeHired({
        employeeId: saved.id.value,
        organizationId,
        clinicId: data.clinicId,
        actorId: ctx.actor.userId,
        source: LogSource.WEB,
        action: LogAction.EMPLOYEE_HIRE,
        type: LogType.INFO,
        details: `Personel işe alındı: ${saved.fullName.value}`,
      });

      return saved.id.value;
    });
  }
}
