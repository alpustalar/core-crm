import { IQuery } from '@nestjs/cqrs';
import { FindPatientByContactResponse } from './find-patient-by-contact.response';

export class FindPatientByContactQuery implements IQuery {
  readonly __responseType!: FindPatientByContactResponse;
  constructor(
    public readonly payload: {
      clinicId: string;
      phone?: string | null;
      email?: string | null;
    }
  ) {}
}
