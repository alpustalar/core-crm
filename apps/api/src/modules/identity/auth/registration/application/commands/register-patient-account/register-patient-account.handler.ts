import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterPatientAccountCommand } from './register-patient-account.command';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { FindPatientByContactQuery } from '@modules/crm/patient/application/queries/find-patient-by-contact/find-patient-by-contact.query';
import { LinkFirebaseAccountCommand } from '@modules/crm/patient/application/commands/link-firebase-account/link-firebase-account.command';
import { CreatePatientCommand } from '@modules/crm/patient/application/commands/create-patient/create-patient.command';

@CommandHandler(RegisterPatientAccountCommand)
export class RegisterPatientAccountHandler
  implements ICommandHandler<RegisterPatientAccountCommand, string>
{
  constructor(
    private readonly queryBus: TSQueryBus,
    private readonly commandBus: TSCommandBus
  ) {}

  async execute(command: RegisterPatientAccountCommand): Promise<string> {
    const { organizationId, clinicId, phone, firebaseUid, firstName } =
      command.input;

    const { data: existing } = await this.queryBus.execute(
      new FindPatientByContactQuery(clinicId, phone)
    );

    if (existing) {
      return await this.commandBus.execute(
        new LinkFirebaseAccountCommand(firebaseUid, existing.id)
      );
    }

    return await this.commandBus.execute(
      new CreatePatientCommand({
        phone,
        organizationId,
        firebaseUid,
        firstName,
        clinicId,
      })
    );
  }
}
