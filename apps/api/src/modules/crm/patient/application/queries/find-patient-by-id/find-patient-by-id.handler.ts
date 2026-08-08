import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindPatientByIdQuery } from './find-patient-by-id.query';
import { Inject } from '@nestjs/common';
import { FindPatientByIdQueryResponse } from '@modules/crm/patient/application/queries/find-patient-by-id/find-patient-by-id.response';
import { PatientNotFoundException } from '@modules/crm/patient/domain/exceptions/patient.exceptions';
import {
  IPatientQueryRepository,
  PATIENT_QUERY_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient/patient.query.repository';

@QueryHandler(FindPatientByIdQuery)
export class FindPatientByIdHandler
  implements IQueryHandler<FindPatientByIdQuery, FindPatientByIdQueryResponse>
{
  constructor(
    @Inject(PATIENT_QUERY_REPOSITORY)
    private readonly patientRepo: IPatientQueryRepository
  ) {}

  async execute(
    query: FindPatientByIdQuery
  ): Promise<FindPatientByIdQueryResponse> {
    const { patientId } = query;
    const patient = await this.patientRepo.findById(patientId);

    if (!patient) throw new PatientNotFoundException();

    return {
      data: patient,
    };
  }
}
