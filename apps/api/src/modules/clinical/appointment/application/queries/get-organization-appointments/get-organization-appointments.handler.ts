import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
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
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
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
    const { dto, ctx } = query;
    const { actor } = ctx;

    this.policyFactory
      .organization(actor)
      .evaluator.check(
        (p) => p.isOwnOrganization(organizationId),
        'Bu işlem için yetkiniz yok'
      )
      .orThrow(APPOINTMENT_EVENTS.LIST_ORGANIZATION);

    const { organizationId, ...rest } = dto;

    const { items, total } = await this.appointmentRepo.findByOrganizationId({
      organizationId,
      ...rest,
    });

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(dto.pagination, total),
      },
    };
  }
}
