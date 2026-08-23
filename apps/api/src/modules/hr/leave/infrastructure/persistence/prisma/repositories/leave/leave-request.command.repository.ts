import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { LeaveRequest } from '@modules/hr/leave/domain/entities/leave-request.entity';
import { LeaveStatusSchema } from '@input-type-schemas/LeaveStatusSchema';
import { LeaveTypeSchema } from '@input-type-schemas/LeaveTypeSchema';
import { ILeaveCommandRepository } from '@modules/hr/leave/domain/repositories/leave/leave.command.repository';
import { AnnualLeavePeriod } from '@modules/hr/leave/domain/contracts/leave.contracts';

@Injectable()
export class LeaveRequestCommandRepository
  extends BaseCommandRepository<LeaveRequest>
  implements ILeaveCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByIdForUpdate(id: string): Promise<LeaveRequest | null> {
    await this.lockRowForUpdate('leave_requests', id);
    return this.findById(id);
  }

  /**
   * Aralıkla **kesişen** izinler: `startDate <= to AND endDate >= from`. Eski
   * `startDate: { gte: from, lte: to }` filtresi yıl aşan izinleri yanlış sayıyordu —
   * 30 Aralık'ta başlayıp ertesi yıla sarkan bir izin, sonraki yılın sorgusunda hiç
   * görünmüyordu.
   */
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
