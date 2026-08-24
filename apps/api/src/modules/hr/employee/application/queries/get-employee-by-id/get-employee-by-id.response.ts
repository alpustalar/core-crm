import { QueryResponse } from '@shared/common/response/response.interface';
import { EmployeeWithContracts } from '@modules/hr/employee/domain/contracts';

export type GetEmployeeByIdResponse = QueryResponse<EmployeeWithContracts | null>;
