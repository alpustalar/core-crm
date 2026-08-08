import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CheckInAppointmentCommand } from './check-in-appointment.command';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { AppointmentNotFoundException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment';

/**
 * Randevuyu check-in (ARRIVED) eder. Yükle → domain metodu (checkIn: durum geçişi +
 * geliş zamanı + CheckedIn event) → kaydet. Kritik olmayan yan etki → run().
 */
@CommandHandler(CheckInAppointmentCommand)
export class CheckInAppointmentHandler implements ICommandHandler<
  CheckInAppointmentCommand,
  void
> {
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentRepo: IAppointmentCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CheckInAppointmentCommand): Promise<void> {
    const { appointmentId, ctx } = command;
    const { actor, source } = ctx;

    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) throw new AppointmentNotFoundException();

    this.policyFactory
      .appointment(actor, source)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(appointment.clinicId.value),
        'Bu randevuya erişim yetkiniz yok.'
      )
      .orThrow(APPOINTMENT_EVENTS.CHECK_IN);

    const validateOptions = this.policyFactory
      .entity(actor, source)
      .policy.getValidateOptions();

    appointment.rules(validateOptions).checkIn.orThrow();

    appointment.checkIn();

    await this.txManager.run(async () => {
      await this.appointmentRepo.update(appointment);
    });
  }
}
