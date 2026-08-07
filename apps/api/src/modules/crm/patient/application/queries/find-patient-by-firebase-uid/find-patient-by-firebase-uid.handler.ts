import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindPatientByFirebaseUidQuery } from './find-patient-by-firebase-uid.query';
import { Inject } from '@nestjs/common';
import { FindPatientByFirebaseUidQueryResponse } from '@modules/crm/patient/application/queries/find-patient-by-firebase-uid/find-patient-by-firebase-uid.response';
import {
  PatientNotFoundException,
  PatientNotRegisteredException,
} from '@modules/crm/patient/domain/exceptions/patient.exceptions';
import { isRegisteredPatient } from '@shared';
import {
  IPatientQueryRepository,
  PATIENT_QUERY_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient/patient.query.repository';

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
    const { patientFirebaseUid } = query;
    const patient =
      await this.patientRepo.findByFirebaseUid(patientFirebaseUid);

    if (!patient) throw new PatientNotFoundException();

    const data = patient;
    if (!isRegisteredPatient(data)) {
      throw new PatientNotRegisteredException();
    }

    return { data };
  }
}
