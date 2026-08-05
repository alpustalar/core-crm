import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SearchClinicAppointmentsQuery } from './search-clinic-appointments.query';
import { SearchClinicAppointmentsQueryResponse } from './search-clinic-appointments.response';

import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment/appointment.query-repository.interface';

/**
 * Resepsiyon randevu araması. Aktörün kliniğine sabitlenir (başka klinik aranamaz);
 * ad/telefon + opsiyonel status/doktor/tarih filtreleri repo'ya geçirilir. Sonuç
 * entity listesidir → toPersistence() ile düz modele çevrilip döner.
 */
@QueryHandler(SearchClinicAppointmentsQuery)
export class SearchClinicAppointmentsHandler implements IQueryHandler<
  SearchClinicAppointmentsQuery,
  SearchClinicAppointmentsQueryResponse
> {
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentRepo: IAppointmentQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: SearchClinicAppointmentsQuery
  ): Promise<SearchClinicAppointmentsQueryResponse> {
    const { filter, ctx } = query;

    const serializationOptions = this.policyFactory
      .appointment(ctx.actor, ctx.source)
      .policy.getSerializationOptions({
        clinicId: filter.clinicId,
        providerId: filter.providerId,
      });

    const { pagination, search, status, providerId, startDate, endDate } =
      filter;

    const { items, total } =
      await this.appointmentRepo.searchClinicAppointments({
        clinicId: filter.clinicId,
        pagination,
        search,
        status,
        providerId,
        startDate,
        endDate,
      });

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(pagination, total),
        serializationOptions,
      },
    };
  }
}
