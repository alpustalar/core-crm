import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindPatientByContactQuery } from './find-patient-by-contact.query';
import { FindPatientByContactResponse } from './find-patient-by-contact.response';
import {
  IPatientQueryRepository,
  PATIENT_QUERY_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient.repository.interface';
import { PatientNotFoundException } from '@modules/crm/patient/domain/exceptions/patient.exceptions';

@QueryHandler(FindPatientByContactQuery)
export class FindPatientByContactHandler
  implements
    IQueryHandler<FindPatientByContactQuery, FindPatientByContactResponse>
{
  constructor(
    @Inject(PATIENT_QUERY_REPOSITORY)
    private readonly patientQueryRepo: IPatientQueryRepository
  ) {}

  async execute(
    query: FindPatientByContactQuery
  ): Promise<FindPatientByContactResponse> {
    const patient = await this.patientQueryRepo.findByContact({
      organizationId: query.clinicId,
      phone: query.phone,
      email: query.email,
    });

    if (!patient) throw new PatientNotFoundException();

    return { data: patient.toPersistence() };
  }
}
