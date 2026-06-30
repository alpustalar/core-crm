import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LinkFirebaseAccountCommand } from './link-firebase-account.command';
import { LinkFirebaseAccountCommandResponse } from './link-firebase-account.response';
import {
  IPatientCommandRepository,
  PATIENT_COMMAND_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient.repository.interface';
import { Inject } from '@nestjs/common';
import { PatientNotFoundException } from '@modules/crm/patient/domain/exceptions/patient.exceptions';

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
    private readonly patientCommandRepo: IPatientCommandRepository
  ) {}

  async execute(
    command: LinkFirebaseAccountCommand
  ): Promise<LinkFirebaseAccountCommandResponse> {
    const { firebaseUid, patientId } = command;

    const patient = await this.patientCommandRepo.findById(patientId);

    if (!patient) throw new PatientNotFoundException();

    patient.linkFirebaseAccount(firebaseUid);

    await this.patientCommandRepo.save(patient);
    return patient.id.value;
  }
}
