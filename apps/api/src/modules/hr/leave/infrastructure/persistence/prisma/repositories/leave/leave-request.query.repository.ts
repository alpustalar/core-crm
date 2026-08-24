import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { LeaveRequest as ILeaveRequest } from '@shared';
import {
  AnnualLeavePeriod,
  FindLeavesByEmployeeFilter,
  FindPendingLeavesFilter,
} from '@modules/hr/leave/domain/contracts/leave-request';
import { Paginated } from '@common/interfaces/paginated.type';
import { LeaveStatusSchema } from '@input-type-schemas/LeaveStatusSchema';
import { LeaveTypeSchema } from '@input-type-schemas/LeaveTypeSchema';
import { ILeaveQueryRepository } from '@modules/hr/leave/domain/repositories/leave/leave.query.repository';

/** Okuma tarafı: entity hidrate edilmez; bakiye okuması Command Repo'da. */
@Injectable()
export class LeaveRequestQueryRepository
  extends BaseRepository
  implements ILeaveQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByEmployee(
    filter: FindLeavesByEmployeeFilter
  ): Promise<Paginated<ILeaveRequest>> {
    const where: Record<string, unknown> = { employeeId: filter.employeeId };
    if (filter.status) where.status = filter.status;

    return paginate({
      delegate: this.db.leaveRequest,
      pagination: filter.pagination,
      where,
    });
  }

  findPendingByClinic(
    filter: FindPendingLeavesFilter
  ): Promise<Paginated<ILeaveRequest>> {
    return paginate({
      delegate: this.db.leaveRequest,
      pagination: filter.pagination,
      where: {
        clinicId: filter.clinicId,
        status: LeaveStatusSchema.enum.PENDING,
      },
    });
  }

  /** Command Repo'daki kesişim sorgusunun raporlama kopyası (bkz. o dosyadaki not). */
  findApprovedAnnualLeaves(
    employeeId: string,
    from: Date,
    to: Date
  ): Promise<AnnualLeavePeriod[]> {
    return this.db.leaveRequest.findMany({
      where: {
        employeeId,
        type: LeaveTypeSchema.enum.ANNUAL,
        status: LeaveStatusSchema.enum.APPROVED,
        startDate: { lte: to },
        endDate: { gte: from },
      },
      select: { startDate: true, endDate: true },
    });
  }
}
