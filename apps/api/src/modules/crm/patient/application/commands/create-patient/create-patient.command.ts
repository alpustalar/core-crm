import { IQuery } from '@nestjs/cqrs';
import { CreatePatientResponse } from '@modules/crm/patient/application/commands/create-patient/create-patient.response';
import { CreatePatientDto } from '@shared/modules/patients/dto/queries/create-patient.dto';

export class CreatePatientCommand implements IQuery {
  readonly __responseType!: CreatePatientResponse;

  constructor(public readonly dto: CreatePatientDto) {}
}
