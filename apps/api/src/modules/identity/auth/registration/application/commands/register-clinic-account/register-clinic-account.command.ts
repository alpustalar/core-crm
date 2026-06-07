import { RegisterClinicAccountDto } from '@shared';

export class RegisterClinicAccountCommand {
  constructor(public readonly dto: RegisterClinicAccountDto) {}
}
