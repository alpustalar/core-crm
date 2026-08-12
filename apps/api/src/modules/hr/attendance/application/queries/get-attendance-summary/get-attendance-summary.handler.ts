import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAttendanceSummaryQuery } from './get-attendance-summary.query';
import { GetAttendanceSummaryResponse } from './get-attendance-summary.response';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { ATTENDANCE_EVENTS } from '@src/domain/constants/events/attendance.constant';
import {
  ATTENDANCE_QUERY_REPOSITORY,
  IAttendanceQueryRepository,
} from '@modules/hr/attendance/domain/repositories/attendance/attendance.query.repository';

@QueryHandler(GetAttendanceSummaryQuery)
export class GetAttendanceSummaryHandler
  implements
    IQueryHandler<GetAttendanceSummaryQuery, GetAttendanceSummaryResponse>
{
  constructor(
    @Inject(ATTENDANCE_QUERY_REPOSITORY)
    private readonly attendanceRepo: IAttendanceQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetAttendanceSummaryQuery
  ): Promise<GetAttendanceSummaryResponse> {
    const { employeeId, filter, ctx } = query.payload;

    const { evaluator, policy } = this.policyFactory.employee(
      ctx.actor,
      ctx.source
    );

    evaluator
      .check((p) => p.canManageClinicHr(ctx.actor.clinicId))
      .orThrow(ATTENDANCE_EVENTS.SUMMARY);

    const summary = await this.attendanceRepo.getSummary({
      employeeId,
      from: filter.from,
      to: filter.to,
    });

    return {
      data: summary,
      meta: {
        serializationOptions: policy.getSerializationOptions({
          clinicId: ctx.actor.clinicId ?? '',
        }),
      },
    };
  }
}
