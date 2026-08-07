import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ILeaveCommandRepository } from '@modules/hr/leave/domain/repositories/leave.repository';
import { LeaveRequest } from '@modules/hr/leave/domain/entities/leave-request.entity';
import { LeaveStatusSchema } from '@input-type-schemas/LeaveStatusSchema';
import { LeaveTypeSchema } from '@input-type-schemas/LeaveTypeSchema';

@Injectable()
export class LeaveRequestCommandRepository
  extends BaseCommandRepository<LeaveRequest>
  implements ILeaveCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
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

  async create(entity: LeaveRequest): Promise<LeaveRequest> {
    const raw = await this.db.leaveRequest.create({
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new LeaveRequest(raw);
  }

  async findById(id: string): Promise<LeaveRequest | null> {
    const raw = await this.db.leaveRequest.findUnique({ where: { id } });
    return raw ? new LeaveRequest(raw) : null;
  }

  async update(entity: LeaveRequest): Promise<LeaveRequest> {
    const data = entity.toPersistence();
    const { id, ...update } = data;
    const raw = await this.db.leaveRequest.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new LeaveRequest(raw);
  }
}
