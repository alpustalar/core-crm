import { IQuery } from '@nestjs/cqrs';
import { FindClinicIdByPatientIdQueryResponse } from './find-clinic-id-by-patient-id.response';

export class FindClinicIdByPatientIdQuery implements IQuery {
  readonly __responseType!: FindClinicIdByPatientIdQueryResponse;

  constructor(public readonly patientId: string) {}
}
