import { FindOrCreatePatientForAuth } from '@shared/modules/patients/types/queries';
import { IQuery } from '@nestjs/cqrs';
import { FindOrCreatePatientForAuthQueryResponse } from '@modules/patient/application/queries/find-or-create-patient-for-auth/find-or-create-patient-for-auth.response';

export class FindOrCreatePatientForAuthQuery implements IQuery {
  readonly __responseType!: FindOrCreatePatientForAuthQueryResponse;

  constructor(public readonly dto: FindOrCreatePatientForAuth) {}
}
