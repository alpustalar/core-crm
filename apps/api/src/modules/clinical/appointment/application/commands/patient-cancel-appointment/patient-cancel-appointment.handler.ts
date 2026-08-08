import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PatientCancelAppointmentCommand } from './patient-cancel-appointment.command';
import {
  CancelAppointmentStatus,
  PatientCancelAppointmentResponse,
} from './patient-cancel-appointment.response';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_EVENT_PUBLISHER,
  IAppointmentEventPublisher,
} from '@modules/clinical/appointment/domain/interfaces/appointment-event-publisher.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { DateTimeManager } from '@common/utils';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import {
  AppointmentNotFoundException,
  PatientCancellationDisabledException,
} from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetClinicAppointmentSettingsQuery } from '@modules/organization/clinic/application/queries/get-clinic-appointment-settings/get-clinic-appointment-settings.query';
import {
  IPatientPolicyFactory,
  PATIENT_POLICY_FACTORY,
} from '@modules/platform/policy/patient/domain/interfaces/patient-policy-factory.interface';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment';

@CommandHandler(PatientCancelAppointmentCommand)
export class PatientCancelAppointmentHandler implements ICommandHandler<
  PatientCancelAppointmentCommand,
  PatientCancelAppointmentResponse
> {
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentRepo: IAppointmentCommandRepository,
    @Inject(APPOINTMENT_EVENT_PUBLISHER)
    private readonly eventPublisher: IAppointmentEventPublisher,
    @Inject(PATIENT_POLICY_FACTORY)
    private readonly patientPolicyFactory: IPatientPolicyFactory,
    private readonly queryBus: TSQueryBus,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(
    command: PatientCancelAppointmentCommand
  ): Promise<PatientCancelAppointmentResponse> {
    const { dto, ctx } = command;
    const { appointmentId, cancelReason } = dto;
    const { actor, source } = ctx;

    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) throw new AppointmentNotFoundException();

    this.patientPolicyFactory
      .appointment(actor, source)
      .evaluator.check(
        (p) => p.canCancelOwnBooking(appointment.toPersistence()),
        'Bu randevuyu iptal etme yetkiniz yok.'
      )
      .orThrow(APPOINTMENT_EVENTS.CANCELLED);

    // Klinik randevu ayarları (satır yoksa DB default'ları: 24 saat sınır,
    // patient iptal açık) — iptal penceresi ve izin buradan gelir.
    const { data: settings } = await this.queryBus.execute(
      new GetClinicAppointmentSettingsQuery(appointment.clinicId.value)
    );

    // Hasta panelden iptal edemiyorsa engelle — klinik ile iletişime geçmeli.
    if (!settings.allowPatientCancel) {
      throw new PatientCancellationDisabledException();
    }

    // Randevuya klinik sınırından (cancelLimitHours) daha az kaldıysa hasta
    // doğrudan iptal edemez; sekreter onayına düşen "iptal talebi" oluşturulur.
    const isWithinCancelWindow =
      appointment.startTime <=
      DateTimeManager.addHours(
        DateTimeManager.create(),
        settings.cancelLimitHours
      );

    if (isWithinCancelWindow) {
      return this.transactionManager.outboxRun(async () => {
        this.eventPublisher.cancellationRequested({
          appointmentId: appointment.id.value,
          clinicId: appointment.clinicId.value,
          patientId: appointment.patientId?.value ?? null,
          patientName: appointment.patientName.value,
          startTime: appointment.startTime,
          cancelReason,
        });
        return { status: CancelAppointmentStatus.CANCELLATION_REQUESTED };
      });
    }

    appointment.cancelBooking(actor.patientId ?? actor.email, cancelReason);
    return this.transactionManager.outboxRun(async () => {
      await this.appointmentRepo.update(appointment);
      return { status: CancelAppointmentStatus.CANCELLED };
    });
  }
}
