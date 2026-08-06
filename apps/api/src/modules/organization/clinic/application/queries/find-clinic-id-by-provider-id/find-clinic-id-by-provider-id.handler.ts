import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindClinicIdByProviderIdQuery } from './find-clinic-id-by-provider-id.query';
import { FindClinicIdByProviderIdQueryResponse } from './find-clinic-id-by-provider-id.response';
import { Inject } from '@nestjs/common';
import {
  CLINIC_CACHE_SERVICE,
  IClinicCacheService,
} from '@modules/organization/clinic/domain/interfaces/clinic-cache.service.interface';
import { ClinicNotFoundException } from '@modules/organization/clinic/domain/exceptions/clinic.exceptions';
import {
  CLINIC_QUERY_REPOSITORY,
  IClinicQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic/clinic.query.repository.interface';

@QueryHandler(FindClinicIdByProviderIdQuery)
export class FindClinicIdByProviderIdHandler
  implements
    IQueryHandler<
      FindClinicIdByProviderIdQuery,
      FindClinicIdByProviderIdQueryResponse
    >
{
  constructor(
    @Inject(CLINIC_QUERY_REPOSITORY)
    private readonly clinicRepo: IClinicQueryRepository,
    @Inject(CLINIC_CACHE_SERVICE)
    private readonly clinicCacheService: IClinicCacheService
  ) {}

  async execute(
    query: FindClinicIdByProviderIdQuery
  ): Promise<FindClinicIdByProviderIdQueryResponse> {
    const { providerId } = query;

    const payload = await this.clinicCacheService
      .clinicIdByProviderId()
      .get(providerId);

    if (payload) {
      return payload;
    }

    const clinicId = await this.clinicRepo.findIdByProviderId(providerId);

    if (!clinicId) throw new ClinicNotFoundException();

    await this.clinicCacheService
      .clinicIdByProviderId()
      .set(providerId, { clinicId });

    return { clinicId };
  }
}
