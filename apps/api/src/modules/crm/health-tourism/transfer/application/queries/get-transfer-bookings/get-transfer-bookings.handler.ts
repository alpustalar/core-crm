import {
  HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY,
  IHotelbedsTransferBookingQueryRepository,
} from '@modules/crm/health-tourism/transfer/domain/repositories/hotelbeds-transfer-booking/hotelbeds-transfer-booking.query.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import { GetTransferBookingsQuery } from './get-transfer-bookings.query';
import { GetTransferBookingsResponse } from './get-transfer-bookings.response';
import { TENANT_SCOPE_RESOLVER } from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import { ITenantScopeResolver } from '@shared';

@QueryHandler(GetTransferBookingsQuery)
export class GetTransferBookingsHandler
  implements
    IQueryHandler<GetTransferBookingsQuery, GetTransferBookingsResponse>
{
  constructor(
    @Inject(HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY)
    private readonly hotelbedsTransferBookingRepo: IHotelbedsTransferBookingQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver
  ) {}

  async execute(
    query: GetTransferBookingsQuery
  ): Promise<GetTransferBookingsResponse> {
    const { filter, ctx } = query;
    const { actor, source } = ctx;

    const organizationId = await this.tenantScopeResolver.resolve(filter);

    const { items: transferBooking, total } =
      await this.hotelbedsTransferBookingRepo.findMany(
        {
          organizationId,
          clinicId: filter.clinicId,
          patientId: filter.patientId,
          leadId: filter.leadId,
        },
        filter.pagination
      );

    return {
      data: transferBooking,
      meta: {
        pagination: buildPaginationMeta(filter.pagination, total),
        serializationOptions: this.policyFactory
          .clinic(actor, source)
          .policy.getSerializationOptions({ clinicId: filter.clinicId }),
      },
    };
  }
}
