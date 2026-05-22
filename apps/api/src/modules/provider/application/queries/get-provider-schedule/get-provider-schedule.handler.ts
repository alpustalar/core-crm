import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IProviderAvailabilityRepository,
  PROVIDER_AVAILABILITY_REPOSITORY,
} from '@modules/provider/domain/repositories/provider-availability.repository.interface';
import {
  IProviderQueryRepository,
  PROVIDER_QUERY_REPOSITORY,
} from '@modules/provider/domain/repositories/provider.repository.interface';
import { GetProviderScheduleQuery } from './get-provider-schedule.query';
import { GetProviderScheduleQueryResponse } from './get-provider-schedule.response';
import { OperationMode } from '@prisma/client';

@QueryHandler(GetProviderScheduleQuery)
export class GetProviderScheduleHandler
  implements
    IQueryHandler<GetProviderScheduleQuery, GetProviderScheduleQueryResponse>
{
  constructor(
    @Inject(PROVIDER_AVAILABILITY_REPOSITORY)
    private readonly providerAvailabilityRepo: IProviderAvailabilityRepository,
    @Inject(PROVIDER_QUERY_REPOSITORY)
    private readonly providerQueryRepo: IProviderQueryRepository
  ) {}

  async execute(
    query: GetProviderScheduleQuery
  ): Promise<GetProviderScheduleQueryResponse> {
    const { providerId, startDate, endDate } = query;

    const provider = await this.providerQueryRepo.findById(providerId);
    if (!provider) {
      throw new NotFoundException('Provider bulunamadı.');
    }

    const exceptions =
      await this.providerAvailabilityRepo.findExceptionsByDateRange(
        providerId,
        startDate,
        endDate
      );

    if (provider.operationMode === OperationMode.SHIFT) {
      const shifts = await this.providerAvailabilityRepo.findShiftsByDateRange(
        providerId,
        startDate,
        endDate
      );
      return {
        data: { operationMode: OperationMode.SHIFT, shifts, exceptions },
      };
    }

    const availabilities =
      await this.providerAvailabilityRepo.findByProviderId(providerId);
    return {
      data: { operationMode: OperationMode.STATIC, availabilities, exceptions },
    };
  }
}
