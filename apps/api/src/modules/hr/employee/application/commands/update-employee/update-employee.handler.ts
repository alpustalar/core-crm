import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateEmployeeCommand } from './update-employee.command';
import { EmployeeNotFoundException } from '@modules/hr/employee/domain/exceptions/employee.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { EMPLOYEE_EVENTS } from '@src/domain/constants/events/employee.constant';
import {
  EMPLOYEE_COMMAND_REPOSITORY,
  IEmployeeCommandRepository,
} from '@modules/hr/employee/domain/repositories/employee/employee.command.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@CommandHandler(UpdateEmployeeCommand)
export class UpdateEmployeeHandler
  implements ICommandHandler<UpdateEmployeeCommand, void>
{
  constructor(
    @Inject(EMPLOYEE_COMMAND_REPOSITORY)
    private readonly employeeRepo: IEmployeeCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: UpdateEmployeeCommand): Promise<void> {
    const { employeeId, ctx, data } = command.payload;

    await this.txManager.run(async () => {
      const employee = await this.employeeRepo.findById(employeeId);
      if (!employee) throw new EmployeeNotFoundException(employeeId);

      this.policyFactory
        .employee(ctx.actor, ctx.source)
        .evaluator.check((p) => p.canManageClinicHr(employee.clinicId.value))
        .orThrow(EMPLOYEE_EVENTS.UPDATE);

      employee.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        nationalId: data.nationalId,
        title: data.title,
        department: data.department,
        employmentType: data.employmentType,
        annualLeaveEntitlement: data.annualLeaveEntitlement,
      });

      await this.employeeRepo.update(employee);
    });
  }
}
