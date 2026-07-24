import { z } from 'zod';

export const EmployeeContractScalarFieldEnumSchema = z.enum(['id','employeeId','type','startDate','endDate','grossSalary','currency','isActive','createdAt','updatedAt']);

export default EmployeeContractScalarFieldEnumSchema;
