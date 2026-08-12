import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicTimezoneQuery } from './get-clinic-timezone.query';
import { GetClinicTimezoneResponse } from './get-clinic-timezone.response';
import {
  CLINIC_QUERY_REPOSITORY,
  IClinicQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic/clinic.query.repository';
import {
  CLINIC_CACHE_SERVICE,
  IClinicCacheService,
} from '@modules/organization/clinic/domain/interfaces/clinic-cache.service.interface';
import { ClinicNotFoundException } from '@modules/organization/clinic/domain/exceptions/clinic.exceptions';

@QueryHandler(GetClinicTimezoneQuery)
export class GetClinicTimezoneHandler
  implements IQueryHandler<GetClinicTimezoneQuery, GetClinicTimezoneResponse>
{
  constructor(
    @Inject(CLINIC_QUERY_REPOSITORY)
    private readonly clinicRepo: IClinicQueryRepository,
    @Inject(CLINIC_CACHE_SERVICE)
    private readonly cacheService: IClinicCacheService
  ) {}

  async execute(
    query: GetClinicTimezoneQuery
  ): Promise<GetClinicTimezoneResponse> {
    const cache = this.cacheService.clinicTimeZone();

    const cached = await cache.get(query.clinicId);
    if (cached) return { data: cached.timezone };

    const clinic = await this.clinicRepo.findById(query.clinicId);
    if (!clinic) {
      throw new ClinicNotFoundException();
    }

    await cache.set(query.clinicId, { timezone: clinic.timezone });

    return { data: clinic.timezone };
  }
}
