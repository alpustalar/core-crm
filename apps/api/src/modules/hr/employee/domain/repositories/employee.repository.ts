import { Employee as IEmployee } from '@shared';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { Employee } from '@modules/hr/employee/domain/entities/employee.entity';
import { EmployeeContract } from '@modules/hr/employee/domain/entities/employee-contract.entity';
import {
  EmployeeWithContracts,
  FindEmployeesFilter,
} from '@modules/hr/employee/domain/contracts/employee.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const EMPLOYEE_COMMAND_REPOSITORY = Symbol('IEmployeeCommandRepository');
export const EMPLOYEE_CONTRACT_COMMAND_REPOSITORY = Symbol(
  'IEmployeeContractCommandRepository'
);
export const EMPLOYEE_QUERY_REPOSITORY = Symbol('IEmployeeQueryRepository');

export type IEmployeeCommandRepository = IBaseCommandRepository<Employee>;

export interface IEmployeeContractCommandRepository
  extends IBaseCommandRepository<EmployeeContract> {
  /** Çalışanın aktif sözleşmesi (yeni sözleşme eklenirken sonlandırmak için). */
  findActiveByEmployeeId(employeeId: string): Promise<EmployeeContract | null>;
}

export interface IEmployeeQueryRepository {
  /** Çalışan + (varsa) sözleşmeleri read-model olarak. */
  findById(id: string): Promise<EmployeeWithContracts | null>;
  /** Kliniğin (silinmemiş) çalışanları. */
  findByClinic(filter: FindEmployeesFilter): Promise<Paginated<IEmployee>>;
}
