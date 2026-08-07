import {
  IProviderExceptionQueryRepository,
  PROVIDER_EXCEPTION_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider-exception/provider-exception.query.repository';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProviderScheduleQuery } from '@modules/clinical/provider/application/queries';
import { GetProviderScheduleQueryResponse } from '@modules/clinical/provider/application/queries/get-provider-schedule/get-provider-schedule.response';
import { Inject } from '@nestjs/common';
import {
  IProviderAvailabilityQueryRepository,
  PROVIDER_AVAILABILITY_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider-availability/provider-availability.query.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindClinicIdByProviderIdQuery } from '@modules/organization/clinic/application/queries/find-clinic-id-by-provider-id/find-clinic-id-by-provider-id.query';
import { ProviderNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider.exceptions';
import { DateRange } from '@src/domain/value-objects';
import { OperationModeSchema } from '@input-type-schemas/OperationModeSchema';
import {
  IProviderQueryRepository,
  PROVIDER_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider/provider.query.repository';
import {
  IProviderShiftQueryRepository,
  PROVIDER_SHIFT_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider-shift/provider-shift.query.repository';

@QueryHandler(GetProviderScheduleQuery)
export class GetProviderScheduleHandler
  implements
    IQueryHandler<GetProviderScheduleQuery, GetProviderScheduleQueryResponse>
{
  constructor(
    @Inject(PROVIDER_EXCEPTION_QUERY_REPOSITORY)
    private readonly providerExceptionRepo: IProviderExceptionQueryRepository,
    @Inject(PROVIDER_QUERY_REPOSITORY)
    private readonly providerRepo: IProviderQueryRepository,
    @Inject(PROVIDER_AVAILABILITY_QUERY_REPOSITORY)
    private readonly providerAvailabilityRepo: IProviderAvailabilityQueryRepository,
    @Inject(PROVIDER_SHIFT_QUERY_REPOSITORY)
    private readonly providerShiftRepo: IProviderShiftQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    query: GetProviderScheduleQuery
  ): Promise<GetProviderScheduleQueryResponse> {
    const { providerId, startDate, endDate, ctx } = query.payload;

    const { clinicId } = await this.queryBus.execute(
      new FindClinicIdByProviderIdQuery(providerId)
    );

    const serializationOptions = this.policyFactory
      .provider(ctx.actor, ctx.source)
      .policy.getSerializationOptions(clinicId, providerId);

    const provider = await this.providerRepo.findById(providerId);

    if (!provider) throw new ProviderNotFoundException();

    const exceptionQueryDateRange = DateRange.create(
      startDate,
      endDate
    ).orThrow();

    const exceptions =
      await this.providerExceptionRepo.findExceptionsByDateRange(
        providerId,
        exceptionQueryDateRange.startDate,
        exceptionQueryDateRange.endDate
      );

    if (provider.operationMode === OperationModeSchema.enum.SHIFT) {
      const shifts = await this.providerShiftRepo.findShiftsByDateRange(
        providerId,
        exceptionQueryDateRange.startDate,
        exceptionQueryDateRange.endDate
      );
      return {
        data: {
          operationMode: OperationModeSchema.enum.SHIFT,
          shifts,
          exceptions,
        },
      };
    }

    const availabilities =
      await this.providerAvailabilityRepo.findManyByProviderId(providerId);
    return {
      data: {
        operationMode: OperationModeSchema.enum.STATIC,
        availabilities,
        exceptions,
      },
      meta: { serializationOptions },
    };
  }
}
