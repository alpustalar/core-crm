import { z } from 'zod';

export const EmployeeScalarFieldEnumSchema = z.enum(['id','organizationId','clinicId','userId','firstName','lastName','email','phone','nationalId','title','department','employmentType','status','hireDate','terminationDate','annualLeaveEntitlement','isDeleted','createdAt','updatedAt']);

export default EmployeeScalarFieldEnumSchema;
