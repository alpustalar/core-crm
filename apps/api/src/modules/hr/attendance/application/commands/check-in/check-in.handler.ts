import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CheckInCommand } from './check-in.command';
import { AttendanceRecord } from '@modules/hr/attendance/domain/entities/attendance-record.entity';
import { AttendanceAlreadyRecordedException } from '@modules/hr/attendance/domain/exceptions/attendance.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { ATTENDANCE_EVENTS } from '@src/domain/constants/events/attendance.constant';
import {
  ATTENDANCE_COMMAND_REPOSITORY,
  IAttendanceCommandRepository,
} from '@modules/hr/attendance/domain/repositories/attendance/attendance.command.repository';

@CommandHandler(CheckInCommand)
export class CheckInHandler implements ICommandHandler<CheckInCommand, string> {
  constructor(
    @Inject(ATTENDANCE_COMMAND_REPOSITORY)
    private readonly attendanceRepo: IAttendanceCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CheckInCommand): Promise<string> {
    const { employeeId, ctx } = command;
    const { actor } = ctx;

    const organizationId =
      actor.organizationId ?? actor.ownedOrganizations?.[0]?.id ?? '';
    const clinicId = actor.clinicId ?? '';

    this.policyFactory
      .employee(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canAccessClinicHr(clinicId))
      .orThrow(ATTENDANCE_EVENTS.CHECK_IN);

    return this.txManager.run(async () => {
      const workDate = DateTimeManager.startOfDay(DateTimeManager.create());
      const existing = await this.attendanceRepo.findByEmployeeAndDate(
        employeeId,
        workDate
      );
      if (existing) {
        throw new AttendanceAlreadyRecordedException(
          employeeId,
          DateTimeManager.toDateKey(workDate)
        );
      }

      const record = AttendanceRecord.checkIn({
        employeeId,
        organizationId,
        clinicId,
      });
      const saved = await this.attendanceRepo.create(record);
      return saved.id.value;
    });
  }
}
