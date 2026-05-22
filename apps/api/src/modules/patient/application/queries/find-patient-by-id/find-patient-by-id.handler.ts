import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindPatientByIdQuery } from './find-patient-by-id.query';
import {
  IPatientRepository,
  PATIENT_REPOSITORY,
} from '@modules/patient/domain/repositories/patient.repository.interface';
import { Inject } from '@nestjs/common';
import { FindPatientByIdQueryResponse } from '@modules/patient/application/queries/find-patient-by-id/find-patient-by-id.response';

@QueryHandler(FindPatientByIdQuery)
export class FindPatientByIdHandler
  implements IQueryHandler<FindPatientByIdQuery, FindPatientByIdQueryResponse>
{
  constructor(
    @Inject(PATIENT_REPOSITORY)
    private readonly patientRepo: IPatientRepository
  ) {}

  async execute(
    query: FindPatientByIdQuery
  ): Promise<FindPatientByIdQueryResponse> {
    const { patientId } = query;
    const patient = await this.patientRepo.find(patientId);

    return {
      data: patient,
    };
  }
}
