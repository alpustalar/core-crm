import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LinkFirebaseAccountCommand } from './link-firebase-account.command';
import { LinkFirebaseAccountCommandResponse } from './link-firebase-account.response';
import { Inject } from '@nestjs/common';
import { PatientNotFoundException } from '@modules/crm/patient/domain/exceptions/patient.exceptions';
import {
  IPatientCommandRepository,
  PATIENT_COMMAND_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient/patient.command.repository';

@CommandHandler(LinkFirebaseAccountCommand)
export class LinkFirebaseAccountHandler
  implements
    ICommandHandler<
      LinkFirebaseAccountCommand,
      LinkFirebaseAccountCommandResponse
    >
{
  constructor(
    @Inject(PATIENT_COMMAND_REPOSITORY)
    private readonly patientRepo: IPatientCommandRepository
  ) {}

  async execute(
    command: LinkFirebaseAccountCommand
  ): Promise<LinkFirebaseAccountCommandResponse> {
    const { firebaseUid, patientId } = command;

    const patient = await this.patientRepo.findById(patientId);

    if (!patient) throw new PatientNotFoundException();

    patient.linkFirebaseAccount(firebaseUid);

    await this.patientRepo.update(patient);
    return patient.id.value;
  }
}
