import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddEmployeeContractCommand } from './add-employee-contract.command';
import {
  EMPLOYEE_COMMAND_REPOSITORY,
  EMPLOYEE_CONTRACT_COMMAND_REPOSITORY,
  IEmployeeCommandRepository,
  IEmployeeContractCommandRepository,
} from '@modules/hr/employee/domain/repositories/employee.repository';
import { EmployeeContract } from '@modules/hr/employee/domain/entities/employee-contract.entity';
import { EmployeeNotFoundException } from '@modules/hr/employee/domain/exceptions/employee.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { EMPLOYEE_EVENTS } from '@src/domain/constants/events/employee.constant';
import {
  EMPLOYEE_EVENT_PUBLISHER,
  IEmployeeEventPublisher,
} from '@modules/hr/employee/domain/interfaces/employee-event-publisher.interface';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';

@CommandHandler(AddEmployeeContractCommand)
export class AddEmployeeContractHandler implements ICommandHandler<
  AddEmployeeContractCommand,
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
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: AddEmployeeContractCommand): Promise<string> {
    const { employeeId, ctx, data } = command.payload;

    return this.txManager.run(async () => {
      const employee = await this.employeeCommandRepo.findById(employeeId);
      if (!employee) throw new EmployeeNotFoundException(employeeId);

      this.policyFactory
        .employee(ctx.actor, ctx.source)
        .evaluator.check((p) => p.canManageClinicHr(employee.clinicId.value))
        .orThrow(EMPLOYEE_EVENTS.ADD_CONTRACT);

      // Yeni sözleşme başlarken mevcut aktif sözleşmeyi sonlandır (tek aktif kuralı).
      const active =
        await this.contractCommandRepo.findActiveByEmployeeId(employeeId);
      if (active) {
        active.end(data.startDate);
        await this.contractCommandRepo.save(active);
      }

      const contract = EmployeeContract.create({
        employeeId,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        grossSalary: data.grossSalary,
        currency: data.currency,
      });
      const saved = await this.contractCommandRepo.create(contract);

      this.eventPublisher.employeeSalaryChanged({
        employeeId,
        clinicId: employee.clinicId.value,
        contractId: saved.id.value,
        grossSalary: saved.grossSalary.value.toNumber(),
        currency: saved.grossSalary.currency,
        actorId: ctx.actor.userId,
        source: LogSource.WEB,
        action: LogAction.EMPLOYEE_SALARY_CHANGE,
        type: LogType.INFO,
        details: `Yeni sözleşme/maaş: ${saved.grossSalary.value.toString()} ${saved.grossSalary.currency}`,
      });

      return saved.id.value;
    });
  }
}
