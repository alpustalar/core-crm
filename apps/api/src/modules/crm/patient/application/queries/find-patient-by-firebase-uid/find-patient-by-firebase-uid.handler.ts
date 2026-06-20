import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindPatientByFirebaseUidQuery } from './find-patient-by-firebase-uid.query';
import { Inject } from '@nestjs/common';
import { FindPatientByFirebaseUidQueryResponse } from '@modules/crm/patient/application/queries/find-patient-by-firebase-uid/find-patient-by-firebase-uid.response';
import {
  IPatientQueryRepository,
  PATIENT_QUERY_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient.repository.interface';

@QueryHandler(FindPatientByFirebaseUidQuery)
export class FindPatientByFirebaseUidHandler
  implements
    IQueryHandler<
      FindPatientByFirebaseUidQuery,
      FindPatientByFirebaseUidQueryResponse
    >
{
  constructor(
    @Inject(PATIENT_QUERY_REPOSITORY)
    private readonly patientRepo: IPatientQueryRepository
  ) {}

  async execute(
    query: FindPatientByFirebaseUidQuery
  ): Promise<FindPatientByFirebaseUidQueryResponse> {
    const patient = await this.patientRepo.find(query.firebaseUid);
    return {
      data: patient,
    };
  }

  // TODO: firebaseUid ile DBdeki id aynı olacak bu handler kaldırılacak
}
