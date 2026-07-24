import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetClinicCalendarQuery } from './get-clinic-calendar.query';
import { GetClinicCalendarResponse } from './get-clinic-calendar.response';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  ClinicCalendarDay,
  ClinicCalendarEvent,
} from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { DateTimeManager } from '@common/utils';
import { GetClinicTimezoneQuery } from '@modules/organization/clinic/application/queries/get-clinic-timezone/get-clinic-timezone.query';
import { FindProvidersDirectoryQuery } from '@modules/clinical/provider/application/queries/find-providers-directory/find-providers-directory.query';

/**
 * Klinik tam takvimi: verilen tarih aralığındaki tüm randevuları (dolu-boş fark
 * etmeksizin) klinik yerelinde güne gruplayıp döner. Müsaitlik/slot hesaplanmaz.
 * providerId verilirse tek doktora daralır. Randevular hafif projeksiyonla tek
 * sorguda çekilir; doktor adları cross-module directory query'sinden zenginleştirilir
 * (bounded-context: Prisma join YOK). Yetki, klinik-seviye policy ile korunur.
 */
@QueryHandler(GetClinicCalendarQuery)
export class GetClinicCalendarHandler
  implements IQueryHandler<GetClinicCalendarQuery, GetClinicCalendarResponse>
{
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentRepo: IAppointmentQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    query: GetClinicCalendarQuery
  ): Promise<GetClinicCalendarResponse> {
    const { data, ctx } = query;
    const { clinicId, startDate, endDate, providerId, status } = data;

    const serializationOptions = this.policyFactory
      .appointment(ctx.actor, ctx.source)
      .policy.getSerializationOptions({ clinicId, providerId });

    const [{ data: tz }, { data: providers }, rows] = await Promise.all([
      this.queryBus.execute(new GetClinicTimezoneQuery(clinicId)),
      this.queryBus.execute(new FindProvidersDirectoryQuery(clinicId)),
      this.appointmentRepo.findClinicCalendarEvents({
        clinicId,
        startDate,
        endDate,
        providerId,
        status,
      }),
    ]);

    const providerNameById = new Map(
      providers.map((provider) => [provider.providerId, provider.name])
    );

    // Randevuları başlangıç zamanının klinik-yerel gününe göre grupla.
    const byDate = new Map<string, ClinicCalendarEvent[]>();
    for (const row of rows) {
      const date = DateTimeManager.toDateKey(row.startTime, tz);
      const event: ClinicCalendarEvent = {
        appointmentId: row.id,
        providerId: row.providerId,
        providerName: providerNameById.get(row.providerId) ?? null,
        patientId: row.patientId,
        patientName: row.patientName,
        patientPhone: row.patientPhone,
        startTime: row.startTime,
        endTime: row.endTime,
        status: row.status,
        treatmentType: row.treatmentType,
        isConsultation: row.isConsultation,
      };
      const existing = byDate.get(date) ?? [];
      existing.push(event);
      byDate.set(date, existing);
    }

    const days: ClinicCalendarDay[] = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, events]) => ({
        date,
        events: events.sort(
          (a, b) =>
            a.startTime.getTime() - b.startTime.getTime() ||
            (a.providerName ?? '').localeCompare(b.providerName ?? '')
        ),
      }));

    return { data: days, meta: { serializationOptions } };
  }
}
