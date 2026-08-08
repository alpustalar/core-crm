import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { EmployeeContract } from '@modules/hr/employee/domain/entities/employee-contract.entity';

export const EMPLOYEE_CONTRACT_COMMAND_REPOSITORY = Symbol(
  'IEmployeeContractCommandRepository'
);

export interface IEmployeeContractCommandRepository extends IBaseCommandRepository<EmployeeContract> {
  /** Çalışanın aktif sözleşmesi (yeni sözleşme eklenirken sonlandırmak için). */
  findActiveByEmployeeId(employeeId: string): Promise<EmployeeContract | null>;
}
