import { IQuery } from '@nestjs/cqrs';
import { CreatePatientResponse } from '@modules/crm/patient/application/commands/create-patient/create-patient.response';
import { CreatePatient } from '@shared';

export class CreatePatientCommand implements IQuery {
  readonly __responseType!: CreatePatientResponse;

  constructor(public readonly data: CreatePatient) {}
}
