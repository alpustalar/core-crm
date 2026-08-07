import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicOrganizationIdQuery } from './get-clinic-organization-id.query';
import { GetClinicOrganizationIdResponse } from './get-clinic-organization-id.response';

import {
  CLINIC_CACHE_SERVICE,
  IClinicCacheService,
} from '@modules/organization/clinic/domain/interfaces/clinic-cache.service.interface';
import {
  CLINIC_QUERY_REPOSITORY,
  IClinicQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic/clinic.query.repository.interface';

@QueryHandler(GetClinicOrganizationIdQuery)
export class GetClinicOrganizationIdHandler implements IQueryHandler<
  GetClinicOrganizationIdQuery,
  GetClinicOrganizationIdResponse
> {
  constructor(
    @Inject(CLINIC_QUERY_REPOSITORY)
    private readonly clinicRepo: IClinicQueryRepository,
    @Inject(CLINIC_CACHE_SERVICE)
    private readonly cacheService: IClinicCacheService
  ) {}

  async execute(
    query: GetClinicOrganizationIdQuery
  ): Promise<GetClinicOrganizationIdResponse> {
    const cached = await this.cacheService
      .clinicOrganizationId()
      .get(query.clinicId);

    if (cached) return { data: cached.clinicId };

    const clinic = await this.clinicRepo.findById(query.clinicId);
    if (!clinic) {
      throw new Error(`Klinik bulunamadı: ${query.clinicId}`);
    }

    await this.cacheService
      .clinicOrganizationId()
      .set(query.clinicId, { clinicId: clinic.organizationId });

    return { data: clinic.organizationId };
  }
}
