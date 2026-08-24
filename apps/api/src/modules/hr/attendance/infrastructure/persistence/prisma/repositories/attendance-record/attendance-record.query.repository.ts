import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { AttendanceRecord as IAttendanceRecord } from '@shared';
import {
  AttendanceSummary,
  FindAttendanceByEmployeeFilter,
  GetAttendanceSummaryFilter,
} from '@modules/hr/attendance/domain/contracts/attendance-record';
import { Paginated } from '@common/interfaces/paginated.type';
import { IAttendanceQueryRepository } from '@modules/hr/attendance/domain/repositories/attendance/attendance.query.repository';

/** Okuma tarafı: entity hidrate edilmez (veri doğrudan HTTP sınırını geçiyor). */
@Injectable()
export class AttendanceRecordQueryRepository
  extends BaseRepository
  implements IAttendanceQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByEmployee(
    filter: FindAttendanceByEmployeeFilter
  ): Promise<Paginated<IAttendanceRecord>> {
    const where: Record<string, unknown> = { employeeId: filter.employeeId };
    if (filter.from || filter.to) {
      where.workDate = {
        ...(filter.from ? { gte: filter.from } : {}),
        ...(filter.to ? { lte: filter.to } : {}),
      };
    }

    return paginate({
      delegate: this.db.attendanceRecord,
      pagination: filter.pagination,
      where,
    });
  }

  async getSummary(
    filter: GetAttendanceSummaryFilter
  ): Promise<AttendanceSummary> {
    const where = {
      employeeId: filter.employeeId,
      workDate: { gte: filter.from, lte: filter.to },
    };

    const [aggregate, daysRecorded] = await Promise.all([
      this.db.attendanceRecord.aggregate({
        _sum: { workedMinutes: true, overtimeMinutes: true },
        where,
      }),
      this.db.attendanceRecord.count({ where }),
    ]);

    return {
      daysRecorded,
      totalWorkedMinutes: aggregate._sum.workedMinutes ?? 0,
      totalOvertimeMinutes: aggregate._sum.overtimeMinutes ?? 0,
    };
  }
}
