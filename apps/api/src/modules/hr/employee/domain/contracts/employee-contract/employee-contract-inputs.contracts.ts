import { EmploymentTypeType as EmploymentType } from '@input-type-schemas/EmploymentTypeSchema';
import { CurrencyType as Currency } from '@input-type-schemas/CurrencySchema';

// ==========================================
// EMPLOYEE CONTRACT — sözleşme (maaş/istihdam geçmişi)
// ==========================================

export interface CreateEmployeeContractProps {
  id?: string;
  employeeId: string;
  type: EmploymentType;
  startDate: Date;
  endDate?: Date | null;
  grossSalary: number;
  currency?: Currency;
}
