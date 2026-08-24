import { Employee as IEmployee } from '@shared';
import { Pagination } from '@shared/common';
import { EmployeeStatusType as EmployeeStatus } from '@input-type-schemas/EmployeeStatusSchema';
import { EmployeeContractView } from '@modules/hr/employee/domain/contracts/employee-contract';

// ==========================================
// Read-model'ler (query çıktısı)
// ==========================================

export type EmployeeWithContracts = IEmployee & {
  contracts: EmployeeContractView[];
};

export interface FindEmployeesFilter {
  clinicId: string;
  status?: EmployeeStatus;
  pagination: Pagination;
}
