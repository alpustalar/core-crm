import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetEmployeeByIdQuery } from './get-employee-by-id.query';
import { GetEmployeeByIdResponse } from './get-employee-by-id.response';
import {
  EMPLOYEE_QUERY_REPOSITORY,
  IEmployeeQueryRepository,
} from '@modules/hr/employee/domain/repositories/employee.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { EMPLOYEE_EVENTS } from '@src/domain/constants/events/employee.constant';

@QueryHandler(GetEmployeeByIdQuery)
export class GetEmployeeByIdHandler
  implements IQueryHandler<GetEmployeeByIdQuery, GetEmployeeByIdResponse>
{
  constructor(
    @Inject(EMPLOYEE_QUERY_REPOSITORY)
    private readonly employeeQueryRepo: IEmployeeQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: GetEmployeeByIdQuery): Promise<GetEmployeeByIdResponse> {
    const { employeeId, ctx } = query;
    const data = await this.employeeQueryRepo.findById(employeeId);

    if (!data) return { data: null };

    // Aynı klinik personeli detayı görebilir; nationalId/maaş gibi hassas alanlar
    // serileştirme gruplarıyla EmployeeResponseDto seviyesinde gizlenir.
    const { evaluator, policy } = this.policyFactory.employee(
      ctx.actor,
      ctx.source
    );
    evaluator
      .check((p) => p.canAccessClinicHr(data.clinicId))
      .orThrow(EMPLOYEE_EVENTS.DETAIL);

    return {
      data,
      meta: {
        serializationOptions: policy.getSerializationOptions({
          clinicId: data.clinicId,
        }),
      },
    };
  }
}
