import {
  EmployeeWithContracts,
  FindEmployeesFilter,
} from '@modules/hr/employee/domain/contracts/employee.contracts';
import { Paginated } from '@common/interfaces/paginated.type';
import { Employee as IEmployee } from '@shared';

export const EMPLOYEE_QUERY_REPOSITORY = Symbol('IEmployeeQueryRepository');

export interface IEmployeeQueryRepository {
  /** Çalışan + (varsa) sözleşmeleri read-model olarak. */
  findById(id: string): Promise<EmployeeWithContracts | null>;
  /** Kliniğin (silinmemiş) çalışanları. */
  findByClinic(filter: FindEmployeesFilter): Promise<Paginated<IEmployee>>;
}
