import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetEmployeesQuery } from './get-employees.query';
import { GetEmployeesResponse } from './get-employees.response';
import {
  EMPLOYEE_QUERY_REPOSITORY,
  IEmployeeQueryRepository,
} from '@modules/hr/employee/domain/repositories/employee.repository';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { EMPLOYEE_EVENTS } from '@src/domain/constants/events/employee.constant';

@QueryHandler(GetEmployeesQuery)
export class GetEmployeesHandler
  implements IQueryHandler<GetEmployeesQuery, GetEmployeesResponse>
{
  constructor(
    @Inject(EMPLOYEE_QUERY_REPOSITORY)
    private readonly employeeQueryRepo: IEmployeeQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: GetEmployeesQuery): Promise<GetEmployeesResponse> {
    const { clinicId, filter, pagination, ctx } = query.payload;

    // Aynı klinik personeli listeyi görebilir; hassas alanlar (nationalId/maaş)
    // serileştirme gruplarıyla EmployeeResponseDto seviyesinde gizlenir.
    const { evaluator, policy } = this.policyFactory.employee(
      ctx.actor,
      ctx.source
    );
    evaluator
      .check((p) => p.canAccessClinicHr(clinicId))
      .orThrow(EMPLOYEE_EVENTS.LIST);

    const result = await this.employeeQueryRepo.findByClinic({
      clinicId,
      status: filter.status,
      pagination,
    });

    return {
      data: result.items,
      meta: {
        pagination: buildPaginationMeta(pagination, result.total),
        serializationOptions: policy.getSerializationOptions({ clinicId }),
      },
    };
  }
}
