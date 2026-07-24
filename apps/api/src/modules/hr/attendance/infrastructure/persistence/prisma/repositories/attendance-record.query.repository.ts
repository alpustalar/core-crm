import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IAttendanceQueryRepository } from '@modules/hr/attendance/domain/repositories/attendance.repository';
import { AttendanceRecord } from '@modules/hr/attendance/domain/entities/attendance-record.entity';
import {
  AttendanceSummary,
  FindAttendanceByEmployeeFilter,
  GetAttendanceSummaryFilter,
} from '@modules/hr/attendance/domain/contracts/attendance.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

@Injectable()
export class AttendanceRecordQueryRepository
  extends BaseRepository
  implements IAttendanceQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<AttendanceRecord | null> {
    const raw = await this.db.attendanceRecord.findUnique({ where: { id } });
    return raw ? new AttendanceRecord(raw) : null;
  }

  async findByEmployee(
    filter: FindAttendanceByEmployeeFilter
  ): Promise<Paginated<AttendanceRecord>> {
    const where: Record<string, unknown> = { employeeId: filter.employeeId };
    if (filter.from || filter.to) {
      where.workDate = {
        ...(filter.from ? { gte: filter.from } : {}),
        ...(filter.to ? { lte: filter.to } : {}),
      };
    }

    const result = await paginate({
      delegate: this.db.attendanceRecord,
      pagination: filter.pagination,
      where,
    });
    return this.mapPagination(result, (r) => new AttendanceRecord(r));
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
