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
    private readonly providerShiftQueryRepo: IProviderShiftQueryRepository
  ) {}

  async execute(
    query: GetProviderScheduleQuery
  ): Promise<GetProviderScheduleQueryResponse> {
    const { providerId, startDate, endDate } = query;

    const provider = await this.providerQueryRepo.findById(providerId);
    if (!provider) throw new ProviderNotFoundException();

    const exceptions =
      await this.providerExceptionQueryRepo.findExceptionsByDateRange(
        providerId,
        startDate,
        endDate
      );

    if (provider.isShiftMode()) {
      const shifts = await this.providerShiftQueryRepo.findShiftsByDateRange(
        providerId,
        startDate,
        endDate
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
      await this.providerAvailabilityQueryRepo.findByProviderId(providerId);
    return {
      data: {
        operationMode: OperationModeSchema.enum.STATIC,
        availabilities,
        exceptions,
      },
    };
  }
}
