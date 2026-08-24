import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { StaffRescheduleCommand } from './staff-reschedule.command';
import { StaffRescheduleCommandResponse } from './staff-reschedule.response';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { AppointmentNotFoundException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetClinicAppointmentSettingsQuery } from '@modules/organization/clinic/application/queries/get-clinic-appointment-settings/get-clinic-appointment-settings.query';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment';
import {
  APPOINTMENT_CHECKER_SERVICE,
  IAppointmentCheckerService,
} from '@modules/clinical/appointment/domain/interfaces/appointment-checker.service.interface';

@CommandHandler(StaffRescheduleCommand)
export class StaffRescheduleHandler
  implements
    ICommandHandler<StaffRescheduleCommand, StaffRescheduleCommandResponse>
{
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentRepo: IAppointmentCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(APPOINTMENT_CHECKER_SERVICE)
    private readonly appointmentCheckerService: IAppointmentCheckerService,
    private readonly queryBus: TSQueryBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: StaffRescheduleCommand
  ): Promise<StaffRescheduleCommandResponse> {
    const { data, ctx } = command;

    const { appointmentId, startTime, duration, notes, treatmentId } = data;

    const endTime = Appointment.calculateEndTime({
      startTime,
      endTime: data.endTime,
      duration,
    }).orThrow();

    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) throw new AppointmentNotFoundException();

    this.policyFactory
      .appointment(ctx.actor, ctx.source)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(appointment.clinicId.value),
        'Bu randevuyu yeniden zamanlamak için yetkiniz yok.'
      )
      .orThrow(APPOINTMENT_EVENTS.RESCHEDULE);

    const effectiveProviderId = data.providerId ?? appointment.providerId.value;

    // Overbooking kuralı klinik ayarından: staffAllowOverbooking=false ise yeni slot
    // için çakışma engellenir (randevunun kendisi hariç). true ise personel çakışan
    // saate taşıyabilir.
    const { data: settings } = await this.queryBus.execute(
      new GetClinicAppointmentSettingsQuery(appointment.clinicId.value)
    );

    if (!settings.staffAllowOverbooking) {
      await this.appointmentCheckerService.assertNoConflict({
        providerId: effectiveProviderId,
        startTime,
        endTime,
        ignoreAppointmentId: appointmentId,
      });
    }

    const validateOptions = this.policyFactory
      .entity(ctx.actor, ctx.source)
      .policy.getValidateOptions();

    appointment.rules(validateOptions).reschedule(startTime, endTime).orThrow();

    appointment.reschedule({
      startTime,
      endTime,
      providerId: effectiveProviderId,
      notes,
      treatmentId,
    });

    await this.txManager.run(async () => {
      await this.appointmentRepo.update(appointment);
    });
  }
}
