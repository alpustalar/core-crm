import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IProviderAvailabilityRepository,
  PROVIDER_AVAILABILITY_REPO_TOKEN,
} from '@modules/provider/domain/repositories/provider-availability.repository.interface';
import { GetProviderScheduleQuery } from './get-provider-schedule.query';
import { QueryResponse } from '@shared/common/response/response.interface';
import { ProviderScheduleResponse } from './get-provider-schedule.response';

@QueryHandler(GetProviderScheduleQuery)
export class GetProviderScheduleHandler
  implements
    IQueryHandler<
      GetProviderScheduleQuery,
      QueryResponse<ProviderScheduleResponse>
    >
{
  constructor(
    @Inject(PROVIDER_AVAILABILITY_REPO_TOKEN)
    private readonly providerAvailabilityRepo: IProviderAvailabilityRepository
  ) {}

  async execute(
    query: GetProviderScheduleQuery
  ): Promise<QueryResponse<ProviderScheduleResponse>> {
    const { providerId, startDate, endDate } = query;

    const [availabilities, exceptions] = await Promise.all([
      this.providerAvailabilityRepo.findByProviderId(providerId),
      this.providerAvailabilityRepo.findExceptionsByDateRange(
        providerId,
        startDate,
        endDate
      ),
    ]);

    return {
      data: { availabilities, exceptions },
    };
  }
}
