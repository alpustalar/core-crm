import { Inject, Injectable } from '@nestjs/common';
import { IEmployeeLeaveEntitlementService } from './leave-entitlement.service.interface';
import { LeaveEntitlement } from '@modules/hr/employee/domain/value-objects/leave-entitlement.vo';
import { EmployeeNotFoundException } from '@modules/hr/employee/domain/exceptions/employee.exceptions';
import {
  EMPLOYEE_COMMAND_REPOSITORY,
  IEmployeeCommandRepository,
} from '@modules/hr/employee/domain/repositories/employee/employee.command.repository';

@Injectable()
export class EmployeeLeaveEntitlementService
  implements IEmployeeLeaveEntitlementService
{
  constructor(
    @Inject(EMPLOYEE_COMMAND_REPOSITORY)
    private readonly employeeRepo: IEmployeeCommandRepository
  ) {}

  async lockAndGetAnnualEntitlement(
    employeeId: string
  ): Promise<LeaveEntitlement> {
    // Kilit ve okuma tek adımda: `findByIdForUpdate` satırı FOR UPDATE kilitleyip
    // aynı transaction içinde okur. Çalışan yoksa kilitlenecek satır da yoktur —
    // repo `lockRowForUpdateOrFail` ile bunu sesli hataya çevirir, buradaki kontrol
    // onu domain diline (404) tercüme eder.
    const employee = await this.employeeRepo.findByIdForUpdate(employeeId);
    if (!employee) throw new EmployeeNotFoundException(employeeId);

    return LeaveEntitlement.of({
      hireDate: employee.hireDate,
      annualDays: employee.annualLeaveEntitlement,
    });
  }
}
