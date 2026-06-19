import { IQuery } from '@nestjs/cqrs';
import { FindPatientByContactResponse } from './find-patient-by-contact.response';

export class FindPatientByContactQuery implements IQuery {
  readonly __responseType!: FindPatientByContactResponse;
  constructor(
    public readonly clinicId: string,
    public readonly phone?: string | null,
    public readonly email?: string | null
  ) {}
}
