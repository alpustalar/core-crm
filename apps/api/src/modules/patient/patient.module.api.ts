import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { FindPatientByIdQuery } from '@modules/patient/application/queries/find-patient-by-id/find-patient-by-id.query';
import { FindPatientByFirebaseUidQuery } from '@modules/patient/application/queries/find-patient-by-firebase-uid/find-patient-by-firebase-uid.query';
import { FindOrCreatePatientForAuthQuery } from '@modules/patient/application/queries/find-or-create-patient-for-auth/find-or-create-patient-for-auth.query';
import { IPatientModuleApi } from '@modules/patient/domain/interfaces/patient.module.api.interface';
import { FindOrCreatePatientProps } from '@modules/patient/domain/types/find-or-create-patient.props';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { Patient, QueryResponse } from '@shared';

@Injectable()
export class PatientModuleApi implements IPatientModuleApi {
  private readonly context = ExecutionContextFactory.createInternal();

  constructor(private readonly queryBus: QueryBus) {}

  findPatientById(id: string): Promise<QueryResponse<Patient>> {
    return this.queryBus.execute(new FindPatientByIdQuery(id, this.context));
  }

  findPatientByFirebaseUid(firebaseUid: string): Promise<Patient | null> {
    return this.queryBus.execute(
      new FindPatientByFirebaseUidQuery(firebaseUid)
    );
  }

  findOrCreatePatientForAuth(
    props: FindOrCreatePatientProps
  ): Promise<Patient> {
    return this.queryBus.execute(new FindOrCreatePatientForAuthQuery(props));
  }
}
