import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CheckAppointmentConflictsQuery } from './check-appointment-conflicts.query';
import { CheckAppointmentConflictsResponse } from './check-appointment-conflicts.response';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindClinicIdByProviderIdQuery } from '@modules/organization/clinic/application/queries/find-clinic-id-by-provider-id/find-clinic-id-by-provider-id.query';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment';

/**
 * Çakışma görünürlüğü handler'ı. endTime yoksa duration'dan hesaplanır; doktorun o
 * aralıkta çakışan (iptal/gelmedi hariç) randevuları döner. Sonucu boş olması "boş"
 * demektir; dolu olması personeli uyarır ama randevu eklemeyi ENGELLEMEZ.
 */
@QueryHandler(CheckAppointmentConflictsQuery)
export class CheckAppointmentConflictsHandler implements IQueryHandler<
  CheckAppointmentConflictsQuery,
  CheckAppointmentConflictsResponse
> {
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentRepo: IAppointmentQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    query: CheckAppointmentConflictsQuery
  ): Promise<CheckAppointmentConflictsResponse> {
    const { payload } = query;
    const { filter, ctx } = payload;

    const endTime = Appointment.calculateEndTime({
      startTime: filter.startTime,
      endTime: filter.endTime,
      duration: filter.duration,
    }).orThrow();

    const conflicts = await this.appointmentRepo.findConflictingAppointments({
      providerId: filter.providerId,
      startTime: filter.startTime,
      endTime,
      ignoreAppointmentId: filter.ignoreAppointmentId,
    });

    const { clinicId } = await this.queryBus.execute(
      new FindClinicIdByProviderIdQuery(filter.providerId)
    );

    const serializationOptions = this.policyFactory
      .appointment(ctx.actor, ctx.source)
      .policy.getSerializationOptions({
        clinicId,
        providerId: filter.providerId,
      });

    return { data: conflicts, meta: { serializationOptions } };
  }
}
