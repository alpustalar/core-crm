import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindClinicIdByPatientIdQuery } from './find-clinic-id-by-patient-id.query';
import { FindClinicIdByPatientIdQueryResponse } from './find-clinic-id-by-patient-id.response';

import { Inject } from '@nestjs/common';
import { ClinicNotFoundException } from '@modules/organization/clinic/domain/exceptions/clinic.exceptions';
import {
  CLINIC_CACHE_SERVICE,
  IClinicCacheService,
} from '@modules/organization/clinic/domain/interfaces/clinic-cache.service.interface';
import {
  CLINIC_QUERY_REPOSITORY,
  IClinicQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic/clinic.query.repository';

@QueryHandler(FindClinicIdByPatientIdQuery)
export class FindClinicIdByPatientIdHandler
  implements
    IQueryHandler<
      FindClinicIdByPatientIdQuery,
      FindClinicIdByPatientIdQueryResponse
    >
{
  constructor(
    @Inject(CLINIC_QUERY_REPOSITORY)
    private readonly clinicRepo: IClinicQueryRepository,
    @Inject(CLINIC_CACHE_SERVICE)
    private readonly clinicCacheService: IClinicCacheService
  ) {}

  async execute(
    query: FindClinicIdByPatientIdQuery
  ): Promise<FindClinicIdByPatientIdQueryResponse> {
    const { patientId } = query;

    const cached = await this.clinicCacheService
      .clinicIdByPatientId()
      .get(patientId);

    if (cached) {
      return { clinicId: cached.clinicId };
    }

    const clinicId = await this.clinicRepo.findIdByPatientId(patientId);
    if (!clinicId) {
      throw new ClinicNotFoundException();
    }

    await this.clinicCacheService
      .clinicIdByPatientId()
      .set(patientId, { clinicId });

    return { clinicId };
  }
}
