import {
  IPatientCommandRepository,
  PATIENT_COMMAND_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient.repository.interface';
import { Inject } from '@nestjs/common';
import { CommandHandler, IQueryHandler } from '@nestjs/cqrs';
import { CreatePatientCommand } from './create-patient.command';
import { Patient } from '@modules/crm/patient/domain/entities/patient.entity';
import { CreatePatientResponse } from '@modules/crm/patient/application/commands/create-patient/create-patient.response';

@CommandHandler(CreatePatientCommand)
export class CreatePatientHandler
  implements IQueryHandler<CreatePatientCommand, CreatePatientResponse>
{
  constructor(
    @Inject(PATIENT_COMMAND_REPOSITORY)
    private readonly patientCommandRepo: IPatientCommandRepository
  ) {}

  async execute(query: CreatePatientCommand): Promise<CreatePatientResponse> {
    const { dto } = query;

    const createPatient = Patient.create({
      organizationId: dto.organizationId,
      phone: dto.phone,
      id: crypto.randomUUID(),
      firstName: dto.firstName,
    });

    const savedPatient = await this.patientCommandRepo.save(createPatient);

    return savedPatient.id;
  }
}
