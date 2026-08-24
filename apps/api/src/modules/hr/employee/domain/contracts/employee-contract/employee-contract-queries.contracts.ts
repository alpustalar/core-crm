import { Employee as IEmployee } from '@shared';

// ==========================================
// Read-model'ler (query çıktısı)
// ==========================================

/** Sözleşme read-model'i — Employee'in EmployeeWithContracts'ına gömülü çocuk view'ı. */
export interface EmployeeContractView {
  id: string;
  type: IEmployee['employmentType'];
  startDate: Date;
  endDate: Date | null;
  grossSalary: string;
  currency: string;
  isActive: boolean;
}
