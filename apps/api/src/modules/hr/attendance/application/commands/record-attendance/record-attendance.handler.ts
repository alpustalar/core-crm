import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RecordAttendanceCommand } from './record-attendance.command';
import { AttendanceRecord } from '@modules/hr/attendance/domain/entities/attendance-record.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { ATTENDANCE_EVENTS } from '@src/domain/constants/events/attendance.constant';
import {
  ATTENDANCE_COMMAND_REPOSITORY,
  IAttendanceCommandRepository,
} from '@modules/hr/attendance/domain/repositories/attendance/attendance.command.repository';

@CommandHandler(RecordAttendanceCommand)
export class RecordAttendanceHandler
  implements ICommandHandler<RecordAttendanceCommand, void>
{
  constructor(
    @Inject(ATTENDANCE_COMMAND_REPOSITORY)
    private readonly attendanceRepo: IAttendanceCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: RecordAttendanceCommand): Promise<void> {
    const { employeeId, data, ctx } = command.payload;
    const { actor } = ctx;

    const organizationId =
      actor.organizationId ?? actor.ownedOrganizations?.[0]?.id ?? '';
    const clinicId = actor.clinicId ?? '';

    this.policyFactory
      .employee(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canManageClinicHr(clinicId))
      .orThrow(ATTENDANCE_EVENTS.RECORD);

    const record = AttendanceRecord.record({
      employeeId,
      organizationId,
      clinicId,
      workDate: data.workDate,
      checkInAt: data.checkInAt,
      checkOutAt: data.checkOutAt,
      note: data.note,
    });

    await this.txManager.run(async () => {
      await this.attendanceRepo.upsertByEmployeeAndDate(record);
    });
  }
}
