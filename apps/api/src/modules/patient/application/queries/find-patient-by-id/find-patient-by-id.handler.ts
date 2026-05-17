import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindPatientByIdQuery } from './find-patient-by-id.query';
import { QueryResponse } from '@shared/common/response/response.interface';
import {
  IPatientRepository,
  PATIENT_REPO_TOKEN,
} from '@modules/patient/domain/repositories/patient.repository.interface';
import { Inject } from '@nestjs/common';
import { Patient } from '@shared';

@QueryHandler(FindPatientByIdQuery)
export class FindPatientByIdHandler
  implements IQueryHandler<FindPatientByIdQuery, QueryResponse<Patient | null>>
{
  constructor(
    @Inject(PATIENT_REPO_TOKEN)
    private readonly patientRepo: IPatientRepository
  ) {}

  async execute(
    query: FindPatientByIdQuery
  ): Promise<QueryResponse<Patient | null>> {
    const { patientId } = query;
    const patientRaw = await this.patientRepo.find(patientId);

    return {
      data: patientRaw,
    };
  }
}
