import { QueryResponse } from '@shared/common/response/response.interface';
import { Employee } from '@shared';

export type GetEmployeesResponse = QueryResponse<Employee[]>;
