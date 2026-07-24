import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrganizationAppointmentsQuery } from './get-organization-appointments.query';
import { GetOrganizationAppointmentsQueryResponse } from './get-organization-appointments.response';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

@QueryHandler(GetOrganizationAppointmentsQuery)
export class GetOrganizationAppointmentsHandler
  implements
    IQueryHandler<
      GetOrganizationAppointmentsQuery,
      GetOrganizationAppointmentsQueryResponse
    >
{
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentRepo: IAppointmentQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetOrganizationAppointmentsQuery
  ): Promise<GetOrganizationAppointmentsQueryResponse> {
    const { data, ctx } = query;
    const { organizationId, ...restData } = data;

    const serializationOptions = this.policyFactory
      .organization(ctx.actor, ctx.source)
      .policy.getSerializationOptions();

    const { items, total } = await this.appointmentRepo.findByOrganizationId({
      organizationId,
      ...restData,
    });

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(data.pagination, total),
        serializationOptions,
      },
    };
  }
}
