import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindPatientByContactQuery } from './find-patient-by-contact.query';
import { FindPatientByContactResponse } from './find-patient-by-contact.response';
import {
  IPatientRepository,
  PATIENT_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient.repository.interface';

@QueryHandler(FindPatientByContactQuery)
export class FindPatientByContactHandler
  implements
    IQueryHandler<FindPatientByContactQuery, FindPatientByContactResponse>
{
  constructor(
    @Inject(PATIENT_REPOSITORY)
    private readonly patientRepo: IPatientRepository
  ) {}

  async execute(
    query: FindPatientByContactQuery
  ): Promise<FindPatientByContactResponse> {
    const patient = await this.patientRepo.findByContact({
      clinicId: query.clinicId,
      phone: query.phone,
      email: query.email,
    });
    return { data: patient };
  }
}
