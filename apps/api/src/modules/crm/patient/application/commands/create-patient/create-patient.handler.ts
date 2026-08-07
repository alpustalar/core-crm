import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePatientCommand } from './create-patient.command';
import { Patient } from '@modules/crm/patient/domain/entities/patient.entity';
import { CreatePatientResponse } from '@modules/crm/patient/application/commands/create-patient/create-patient.response';
import {
  IPatientCommandRepository,
  PATIENT_COMMAND_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient/patient.command.repository';

@CommandHandler(CreatePatientCommand)
export class CreatePatientHandler
  implements ICommandHandler<CreatePatientCommand, CreatePatientResponse>
{
  constructor(
    @Inject(PATIENT_COMMAND_REPOSITORY)
    private readonly patientRepo: IPatientCommandRepository
  ) {}

  async execute(command: CreatePatientCommand): Promise<CreatePatientResponse> {
    const { dto } = command;

    if (dto.phone) {
      const existing = await this.patientRepo.findByContact({
        organizationId: dto.organizationId,
        phone: dto.phone,
      });

      if (existing) return existing.id.value;
    }

    const patient = Patient.create({
      organizationId: dto.organizationId,
      phone: dto.phone,
      firstName: dto.firstName,
    });

    const saved = await this.patientRepo.create(patient);
    return saved.id.value;
  }
}
