import { ICommand } from '@nestjs/cqrs';

export interface RegisterPatientInput {
  organizationId: string;
  clinicId: string;
  phone: string;
  firebaseUid: string;
  firstName: string;
}

export class RegisterPatientAccountCommand implements ICommand {
  readonly __responseType!: string;

  constructor(public readonly input: RegisterPatientInput) {}
}
