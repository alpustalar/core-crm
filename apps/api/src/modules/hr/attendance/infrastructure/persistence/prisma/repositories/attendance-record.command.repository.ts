import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IAttendanceCommandRepository } from '@modules/hr/attendance/domain/repositories/attendance.repository';
import { AttendanceRecord } from '@modules/hr/attendance/domain/entities/attendance-record.entity';

@Injectable()
export class AttendanceRecordCommandRepository
  extends BaseCommandRepository<AttendanceRecord>
  implements IAttendanceCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: AttendanceRecord): Promise<AttendanceRecord> {
    const raw = await this.db.attendanceRecord.create({
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new AttendanceRecord(raw);
  }

  async findById(id: string): Promise<AttendanceRecord | null> {
    const raw = await this.db.attendanceRecord.findUnique({ where: { id } });
    return raw ? new AttendanceRecord(raw) : null;
  }

  async update(entity: AttendanceRecord): Promise<AttendanceRecord> {
    const data = entity.toPersistence();
    const { id, ...update } = data;
    const raw = await this.db.attendanceRecord.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new AttendanceRecord(raw);
  }

  async findByEmployeeAndDate(
    employeeId: string,
    workDate: Date
  ): Promise<AttendanceRecord | null> {
    const raw = await this.db.attendanceRecord.findUnique({
      where: { employeeId_workDate: { employeeId, workDate } },
    });
    return raw ? new AttendanceRecord(raw) : null;
  }

  async upsertByEmployeeAndDate(
    entity: AttendanceRecord
  ): Promise<AttendanceRecord> {
    const data = entity.toPersistence();
    const { id: _id, ...update } = data;
    const raw = await this.db.attendanceRecord.upsert({
      where: {
        employeeId_workDate: {
          employeeId: data.employeeId,
          workDate: data.workDate,
        },
      },
      create: data,
      update,
    });
    entity.flushEvents();
    return new AttendanceRecord(raw);
  }
}
