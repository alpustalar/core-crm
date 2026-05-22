import { IQuery } from '@nestjs/cqrs';
import { FindPatientByFirebaseUidQueryResponse } from '@modules/patient/application/queries/find-patient-by-firebase-uid/find-patient-by-firebase-uid.response';

export class FindPatientByFirebaseUidQuery implements IQuery {
  readonly __responseType!: FindPatientByFirebaseUidQueryResponse;
  constructor(public readonly firebaseUid: string) {}
}
