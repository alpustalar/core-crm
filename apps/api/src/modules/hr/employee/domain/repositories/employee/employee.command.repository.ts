import { Employee } from '@modules/hr/employee/domain/entities/employee.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const EMPLOYEE_COMMAND_REPOSITORY = Symbol('IEmployeeCommandRepository');

export type IEmployeeCommandRepository = IBaseCommandRepository<Employee>;
