import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAttendanceByEmployeeQuery } from './get-attendance-by-employee.query';
import { GetAttendanceByEmployeeResponse } from './get-attendance-by-employee.response';
import {
  ATTENDANCE_QUERY_REPOSITORY,
  IAttendanceQueryRepository,
} from '@modules/hr/attendance/domain/repositories/attendance.repository';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { ATTENDANCE_EVENTS } from '@src/domain/constants/events/attendance.constant';

@QueryHandler(GetAttendanceByEmployeeQuery)
export class GetAttendanceByEmployeeHandler
  implements
    IQueryHandler<
      GetAttendanceByEmployeeQuery,
      GetAttendanceByEmployeeResponse
    >
{
  constructor(
    @Inject(ATTENDANCE_QUERY_REPOSITORY)
    private readonly attendanceQueryRepo: IAttendanceQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetAttendanceByEmployeeQuery
  ): Promise<GetAttendanceByEmployeeResponse> {
    const { employeeId, filter, pagination, ctx } = query.payload;

    this.policyFactory
      .employee(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canAccessClinicHr(ctx.actor.clinicId))
      .orThrow(ATTENDANCE_EVENTS.LIST);

    const result = await this.attendanceQueryRepo.findByEmployee({
      employeeId,
      from: filter.from,
      to: filter.to,
      pagination,
    });

    return {
      data: result.items.map((item) => item.toPersistence()),
      meta: { pagination: buildPaginationMeta(pagination, result.total) },
    };
  }
}
