import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CancelProviderDayCommand } from './cancel-provider-day.command';
import { CancelProviderDayResponse } from './cancel-provider-day.response';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  APPOINTMENT_EVENT_PUBLISHER,
  IAppointmentEventPublisher,
} from '@modules/clinical/appointment/domain/interfaces/appointment-event-publisher.interface';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindClinicIdByProviderIdQuery } from '@modules/organization/clinic/application/queries/find-clinic-id-by-provider-id/find-clinic-id-by-provider-id.query';

/**
 * Doktor-günü toplu iptal. Bulk `updateMany` domain'i bypass eder (N+1 önlemek); bu
 * yüzden CLAUDE.md kuralı gereği tek bir toplu event (AppointmentsBulkCancelled) elle
 * fırlatılır. Kritik veri değişimi olduğundan event outbox ile atomik mühürlenir.
 */
@CommandHandler(CancelProviderDayCommand)
export class CancelProviderDayHandler
  implements
    ICommandHandler<CancelProviderDayCommand, CancelProviderDayResponse>
{
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentCommandRepo: IAppointmentCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(APPOINTMENT_EVENT_PUBLISHER)
    private readonly eventPublisher: IAppointmentEventPublisher,
    private readonly queryBus: TSQueryBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: CancelProviderDayCommand
  ): Promise<CancelProviderDayResponse> {
    const { actor, source } = command.ctx;
    const { providerId, startDate, endDate, cancelReason } = command.data;

    const { clinicId } = await this.queryBus.execute(
      new FindClinicIdByProviderIdQuery(providerId)
    );

    this.policyFactory
      .appointment(actor, source)
      .evaluator.check(
        (p) => p.canScheduleAppointmentInClinic(clinicId),
        'Bu kliniğin randevularını toplu iptal etme yetkiniz yok.'
      )
      .orThrow(APPOINTMENT_EVENTS.CANCEL_PROVIDER_DAY);

    return this.txManager.outboxRun(async () => {
      const { count } =
        await this.appointmentCommandRepo.cancelAllByProviderInRange({
          providerId,
          clinicId,
          startDate,
          endDate,
          canceledBy: actor.userId,
          cancelReason,
        });

      this.eventPublisher.bulkCancelled({
        clinicId,
        providerId,
        startDate,
        endDate,
        affectedCount: count,
        canceledBy: actor.userId,
        cancelReason,
      });

      return { affectedCount: count };
    });
  }
}
