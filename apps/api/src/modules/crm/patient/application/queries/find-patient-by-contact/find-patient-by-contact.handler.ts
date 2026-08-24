import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindPatientByContactQuery } from './find-patient-by-contact.query';
import { FindPatientByContactResponse } from './find-patient-by-contact.response';
import {
  PatientContactRequiredException,
  PatientNotFoundException,
} from '@modules/crm/patient/domain/exceptions/patient.exceptions';
import {
  IPatientQueryRepository,
  PATIENT_QUERY_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient/patient.query.repository';

@QueryHandler(FindPatientByContactQuery)
export class FindPatientByContactHandler
  implements
    IQueryHandler<FindPatientByContactQuery, FindPatientByContactResponse>
{
  constructor(
    @Inject(PATIENT_QUERY_REPOSITORY)
    private readonly patientRepo: IPatientQueryRepository
  ) {}

  async execute(
    query: FindPatientByContactQuery
  ): Promise<FindPatientByContactResponse> {
    const { payload } = query;

    if (!payload.phone && !payload.email) {
      throw new PatientContactRequiredException();
    }

    const patient = await this.patientRepo.findByContact({
      organizationId: payload.clinicId,
      phone: payload.phone,
      email: payload.email,
    });

    if (!patient) throw new PatientNotFoundException();

    return { data: patient };
  }
}
