import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IProviderAvailabilityQueryRepository,
  PROVIDER_AVAILABILITY_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider-availability.repository.interface';
import {
  IProviderQueryRepository,
  PROVIDER_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider.repository.interface';
import { GetProviderScheduleQuery } from './get-provider-schedule.query';
import { GetProviderScheduleQueryResponse } from './get-provider-schedule.response';
import { OperationModeSchema } from '@input-type-schemas/OperationModeSchema';
import { ProviderNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider.exceptions';
import {
  IProviderExceptionQueryRepository,
  PROVIDER_EXCEPTION_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider-exception.repository.interface';
import {
  IProviderShiftQueryRepository,
  PROVIDER_SHIFT_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider-shift.repository.interface';
import { DateRange } from '@src/domain/value-objects/date-range.vo';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindClinicIdByProviderIdQuery } from '@modules/organization/clinic/application/queries/find-clinic-id-by-provider-id/find-clinic-id-by-provider-id.query';

@QueryHandler(GetProviderScheduleQuery)
export class GetProviderScheduleHandler
  implements
    IQueryHandler<GetProviderScheduleQuery, GetProviderScheduleQueryResponse>
{
  constructor(
    @Inject(PROVIDER_EXCEPTION_QUERY_REPOSITORY)
    private readonly providerExceptionQueryRepo: IProviderExceptionQueryRepository,
    @Inject(PROVIDER_QUERY_REPOSITORY)
    private readonly providerQueryRepo: IProviderQueryRepository,
    @Inject(PROVIDER_AVAILABILITY_QUERY_REPOSITORY)
    private readonly providerAvailabilityQueryRepo: IProviderAvailabilityQueryRepository,
    @Inject(PROVIDER_SHIFT_QUERY_REPOSITORY)
    private readonly providerShiftQueryRepo: IProviderShiftQueryRepository,
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

    const provider = await this.providerQueryRepo.findById(providerId);

    if (!provider) throw new ProviderNotFoundException();

    const exceptionQueryDateRange = DateRange.create(
      startDate,
      endDate
    ).orThrow();

    const exceptions =
      await this.providerExceptionQueryRepo.findExceptionsByDateRange(
        providerId,
        exceptionQueryDateRange.startDate,
        exceptionQueryDateRange.endDate
      );

    if (provider.validate.operationMode.isShift.value) {
      const shifts = await this.providerShiftQueryRepo.findShiftsByDateRange(
        providerId,
        exceptionQueryDateRange.startDate,
        exceptionQueryDateRange.endDate
      );
      return {
        data: {
          operationMode: OperationModeSchema.enum.SHIFT,
          shifts: shifts.map((shift) => shift.toPersistence()),
          exceptions: exceptions.map((exception) => exception.toPersistence()),
        },
      };
    }

    const availabilities =
      await this.providerAvailabilityQueryRepo.findManyByProviderId(providerId);
    return {
      data: {
        operationMode: OperationModeSchema.enum.STATIC,
        availabilities,
        exceptions: exceptions.map((exception) => exception.toPersistence()),
      },
      meta: { serializationOptions },
    };
  }
}
