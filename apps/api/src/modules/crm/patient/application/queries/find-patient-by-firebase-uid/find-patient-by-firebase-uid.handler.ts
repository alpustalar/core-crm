import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindPatientByFirebaseUidQuery } from './find-patient-by-firebase-uid.query';
import { Inject } from '@nestjs/common';
import {
  IPatientRepository,
  PATIENT_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient.repository.interface';
import { FindPatientByFirebaseUidQueryResponse } from '@modules/crm/patient/application/queries/find-patient-by-firebase-uid/find-patient-by-firebase-uid.response';

@QueryHandler(FindPatientByFirebaseUidQuery)
export class FindPatientByFirebaseUidHandler
  implements
    IQueryHandler<
      FindPatientByFirebaseUidQuery,
      FindPatientByFirebaseUidQueryResponse
    >
{
  constructor(
    @Inject(PATIENT_REPOSITORY)
    private readonly patientRepo: IPatientRepository
  ) {}

  async execute(
    query: FindPatientByFirebaseUidQuery
  ): Promise<FindPatientByFirebaseUidQueryResponse> {
    const patient = await this.patientRepo.find(query.firebaseUid);
    return {
      data: patient,
    };
  }
}
