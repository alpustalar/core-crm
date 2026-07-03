import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PatientCancelAppointmentCommand } from './patient-cancel-appointment.command';
import {
  CancelAppointmentStatus,
  PatientCancelAppointmentResponse,
} from './patient-cancel-appointment.response';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import {
  APPOINTMENT_EVENT_PUBLISHER,
  IAppointmentEventPublisher,
} from '@modules/clinical/appointment/domain/interfaces/appointment-event-publisher.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { DateTimeManager } from '@common/utils';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { AppointmentNotFoundException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';

@CommandHandler(PatientCancelAppointmentCommand)
export class PatientCancelAppointmentHandler
  implements
    ICommandHandler<
      PatientCancelAppointmentCommand,
      PatientCancelAppointmentResponse
    >
{
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentCommandRepo: IAppointmentCommandRepository,
    @Inject(APPOINTMENT_EVENT_PUBLISHER)
    private readonly eventPublisher: IAppointmentEventPublisher,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(
    command: PatientCancelAppointmentCommand
  ): Promise<PatientCancelAppointmentResponse> {
    const { dto, ctx } = command;
    const { appointmentId, cancelReason } = dto;
    const { actor, source } = ctx;

    const appointment =
      await this.appointmentCommandRepo.findById(appointmentId);
    if (!appointment) throw new AppointmentNotFoundException();

    this.policyFactory
      .appointment(actor)
      .evaluator.systemBypass(source)
      .check(
        (p) =>
          p.canCancelOwnBooking({
            patientId: appointment.patientId?.value ?? null,
            patientEmail: appointment.patientEmail?.value ?? null,
          }),
        'Bu randevuyu iptal etme yetkiniz yok.'
      )
      .orThrow(APPOINTMENT_EVENTS.CANCELLED);

    const isWithinTwoHours =
      appointment.startTime <= DateTimeManager.addHours(new Date(), 2);

    if (isWithinTwoHours) {
      return this.transactionManager.run(async () => {
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
    return this.transactionManager.run(async () => {
      await this.appointmentCommandRepo.save(appointment);
      return { status: CancelAppointmentStatus.CANCELLED };
    });
  }
}
