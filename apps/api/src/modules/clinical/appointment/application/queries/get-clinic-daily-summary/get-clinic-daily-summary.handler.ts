import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AppointmentStatusSchema } from '@shared';
import { GetClinicDailySummaryQuery } from './get-clinic-daily-summary.query';
import { GetClinicDailySummaryQueryResponse } from './get-clinic-daily-summary.response';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { ClinicDailySummary } from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { DateTimeManager } from '@common/utils';
import { GetClinicTimezoneQuery } from '@modules/organization/clinic/application/queries/get-clinic-timezone/get-clinic-timezone.query';
import { FindClinicIdByProviderIdQuery } from '@modules/organization/clinic/application/queries/find-clinic-id-by-provider-id/find-clinic-id-by-provider-id.query';
import { ClinicNotFoundException } from '@modules/organization/clinic/domain/exceptions/clinic.exceptions';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

/**
 * Resepsiyon günlük özeti. Aktörün kliniğine sabitlenir; klinik saat dilimini alıp
 * verilen günün yerel sınırlarını (00:00–23:59) hesaplar, tek groupBy sorgusuyla
 * status sayımlarını çeker ve düz özete katlar. Entity sızmaz — okuma-modeli döner.
 */
@QueryHandler(GetClinicDailySummaryQuery)
export class GetClinicDailySummaryHandler
  implements
    IQueryHandler<
      GetClinicDailySummaryQuery,
      GetClinicDailySummaryQueryResponse
    >
{
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentRepo: IAppointmentQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    query: GetClinicDailySummaryQuery
  ): Promise<GetClinicDailySummaryQueryResponse> {
    const { data, ctx } = query;
    const { date, providerId } = data;

    const { clinicId } = providerId
      ? await this.queryBus.execute(
          new FindClinicIdByProviderIdQuery(providerId)
        )
      : ctx.actor.clinicId
        ? ctx.actor
        : data;

    if (!clinicId) throw new ClinicNotFoundException();

    const serializationOptions = this.policyFactory
      .appointment(ctx.actor, ctx.source)
      .policy.getSerializationOptions({ clinicId, providerId });

    const { data: tz } = await this.queryBus.execute(
      new GetClinicTimezoneQuery(clinicId)
    );

    const counts = await this.appointmentRepo.countClinicAppointmentsByStatus({
      clinicId,
      providerId,
      dayStart: DateTimeManager.startOfDay(date, tz),
      dayEnd: DateTimeManager.endOfDay(date, tz),
    });

    const countByStatus = new Map(
      counts.map((clinicStatusCount) => [
        clinicStatusCount.status,
        clinicStatusCount.count,
      ])
    );
    const at = (status: keyof typeof AppointmentStatusSchema.enum): number =>
      countByStatus.get(status) ?? 0;

    const summary: ClinicDailySummary = {
      date: DateTimeManager.toDateKey(date, tz),
      total: counts.reduce(
        (sum, clinicStatusCount) => sum + clinicStatusCount.count,
        0
      ),
      pending: at(AppointmentStatusSchema.enum.PENDING),
      confirmed: at(AppointmentStatusSchema.enum.CONFIRMED),
      cancelled: at(AppointmentStatusSchema.enum.CANCELLED),
      completed: at(AppointmentStatusSchema.enum.COMPLETED),
      noShow: at(AppointmentStatusSchema.enum.NOSHOW),
    };

    return {
      data: summary,
      meta: {
        serializationOptions,
      },
    };
  }
}
