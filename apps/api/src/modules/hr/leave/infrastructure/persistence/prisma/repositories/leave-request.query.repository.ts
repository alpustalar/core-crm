import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { ILeaveQueryRepository } from '@modules/hr/leave/domain/repositories/leave.repository';
import { LeaveRequest } from '@modules/hr/leave/domain/entities/leave-request.entity';
import {
  FindLeavesByEmployeeFilter,
  FindPendingLeavesFilter,
} from '@modules/hr/leave/domain/contracts/leave.contracts';
import { Paginated } from '@common/interfaces/paginated.type';
import { LeaveStatusSchema } from '@input-type-schemas/LeaveStatusSchema';
import { LeaveTypeSchema } from '@input-type-schemas/LeaveTypeSchema';

@Injectable()
export class LeaveRequestQueryRepository
  extends BaseRepository
  implements ILeaveQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<LeaveRequest | null> {
    const raw = await this.db.leaveRequest.findUnique({ where: { id } });
    return raw ? new LeaveRequest(raw) : null;
  }

  async findByEmployee(
    filter: FindLeavesByEmployeeFilter
  ): Promise<Paginated<LeaveRequest>> {
    const where: Record<string, unknown> = { employeeId: filter.employeeId };
    if (filter.status) where.status = filter.status;

    const result = await paginate({
      delegate: this.db.leaveRequest,
      pagination: filter.pagination,
      where,
    });
    return this.mapPagination(result, (r) => new LeaveRequest(r));
  }

  async findPendingByClinic(
    filter: FindPendingLeavesFilter
  ): Promise<Paginated<LeaveRequest>> {
    const result = await paginate({
      delegate: this.db.leaveRequest,
      pagination: filter.pagination,
      where: {
        clinicId: filter.clinicId,
        status: LeaveStatusSchema.enum.PENDING,
      },
    });
    return this.mapPagination(result, (r) => new LeaveRequest(r));
  }

  async sumApprovedAnnualDays(
    employeeId: string,
    from: Date,
    to: Date
  ): Promise<number> {
    const result = await this.db.leaveRequest.aggregate({
      _sum: { days: true },
      where: {
        employeeId,
        type: LeaveTypeSchema.enum.ANNUAL,
        status: LeaveStatusSchema.enum.APPROVED,
        startDate: { gte: from, lte: to },
      },
    });
    return result._sum.days ?? 0;
  }
}
