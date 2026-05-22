import { RegisterOrganizationAccountDto } from '@shared';

export class RegisterOrganizationAccountCommand {
  constructor(public readonly dto: RegisterOrganizationAccountDto) {}
}
