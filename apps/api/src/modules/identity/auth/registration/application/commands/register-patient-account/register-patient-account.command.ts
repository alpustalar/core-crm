import { ICommand } from '@nestjs/cqrs';

export class RegisterPatientAccountCommand implements ICommand {
  readonly __responseType!: string;

  constructor(
    public readonly input: {
      organizationId: string;
      clinicId: string;
      phone: string;
      firebaseUid: string;
      firstName: string;
    }
  ) {}
}
