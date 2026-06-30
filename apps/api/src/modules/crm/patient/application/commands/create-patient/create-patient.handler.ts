import {
  IPatientCommandRepository,
  IPatientQueryRepository,
  PATIENT_COMMAND_REPOSITORY,
  PATIENT_QUERY_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient.repository.interface';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePatientCommand } from './create-patient.command';
import { Patient } from '@modules/crm/patient/domain/entities/patient.entity';
import { CreatePatientResponse } from '@modules/crm/patient/application/commands/create-patient/create-patient.response';

@CommandHandler(CreatePatientCommand)
export class CreatePatientHandler
  implements ICommandHandler<CreatePatientCommand, CreatePatientResponse>
{
  constructor(
    @Inject(PATIENT_COMMAND_REPOSITORY)
    private readonly patientCommandRepo: IPatientCommandRepository,
    @Inject(PATIENT_QUERY_REPOSITORY)
    private readonly patientQueryRepo: IPatientQueryRepository
  ) {}

  async execute(command: CreatePatientCommand): Promise<CreatePatientResponse> {
    const { dto } = command;

    if (dto.phone) {
      const existing = await this.patientQueryRepo.findByContact({
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

    const saved = await this.patientCommandRepo.save(patient);
    return saved.id.value;
  }
}
