import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicTimezoneQuery } from './get-clinic-timezone.query';
import { GetClinicTimezoneResponse } from './get-clinic-timezone.response';
import {
  CLINIC_QUERY_REPOSITORY,
  IClinicQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic/clinic.query.repository.interface';

@QueryHandler(GetClinicTimezoneQuery)
export class GetClinicTimezoneHandler implements IQueryHandler<
  GetClinicTimezoneQuery,
  GetClinicTimezoneResponse
> {
  constructor(
    @Inject(CLINIC_QUERY_REPOSITORY)
    private readonly clinicRepo: IClinicQueryRepository
  ) {}

  async execute(
    query: GetClinicTimezoneQuery
  ): Promise<GetClinicTimezoneResponse> {
    const clinic = await this.clinicRepo.findById(query.clinicId);
    if (!clinic) {
      throw new Error(`Klinik bulunamadı: ${query.clinicId}`);
    }
    return { data: clinic.timezone };
  }
}
