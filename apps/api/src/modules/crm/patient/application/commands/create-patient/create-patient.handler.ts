import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePatientCommand } from './create-patient.command';
import { Patient } from '@modules/crm/patient/domain/entities/patient.entity';
import { CreatePatientResponse } from '@modules/crm/patient/application/commands/create-patient/create-patient.response';
import {
  IPatientCommandRepository,
  PATIENT_COMMAND_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient/patient.command.repository';
import { TENANT_SCOPE_RESOLVER } from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import { ITenantScopeResolver } from '@shared';

@CommandHandler(CreatePatientCommand)
export class CreatePatientHandler
  implements ICommandHandler<CreatePatientCommand, CreatePatientResponse>
{
  constructor(
    @Inject(PATIENT_COMMAND_REPOSITORY)
    private readonly patientRepo: IPatientCommandRepository,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver
  ) {}

  async execute(command: CreatePatientCommand): Promise<CreatePatientResponse> {
    const { data } = command;

    const organizationId = await this.tenantScopeResolver.resolve(data);

    if (data.phone) {
      const existing = await this.patientRepo.findByContact({
        organizationId,
        phone: data.phone,
      });

      if (existing) return existing.id.value;
    }

    const patient = Patient.create({
      organizationId,
      phone: data.phone,
      firstName: data.firstName,
    });

    const saved = await this.patientRepo.create(patient);
    return saved.id.value;
  }
}
