import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateClinicCommand } from './create-clinic.command';
import { Inject } from '@nestjs/common';
import {
  CLINIC_REPO_TOKEN,
  IClinicRepository,
} from '@modules/clinic/domain/repositories/clinic.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY_TOKEN,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import {
  CLINIC_EVENT_PUBLISHER_TOKEN,
  IClinicEventPublisher,
} from '@modules/clinic/domain/interfaces/clinic.event-publisher.interface';

@CommandHandler(CreateClinicCommand)
export class CreateClinicHandler
  implements ICommandHandler<CreateClinicCommand, string | null | undefined>
{
  constructor(
    @Inject(CLINIC_REPO_TOKEN)
    private readonly clinicRepo: IClinicRepository,
    @Inject(POLICY_FACTORY_TOKEN)
    private readonly policyFactory: IPolicyFactory,
    @Inject(CLINIC_EVENT_PUBLISHER_TOKEN)
    private readonly clinicEventPublisher: IClinicEventPublisher
  ) {}

  async execute(command: CreateClinicCommand) {
    const { dto, context } = command;
    const { actor, source } = context;

    if (ExecutionPolicy.isSystemInitiated(source)) {
      const clinicRaw = await this.clinicRepo.create(dto);
      return clinicRaw?.id ?? null;
    }

    const { organizationId } = dto;

    const { evaluator } = this.policyFactory.organization(actor);

    if (organizationId) {
      evaluator
        .check((p) => p.isOwnOrganization(organizationId), 'Yetki ihlali')
        .orThrow();
      // TODO: event fırlat
    }

    // TODO: create clinic başarılı eventi Fırlat

    const clinicRaw = await this.clinicRepo.create(dto);

    return clinicRaw?.id ?? null;
  }
}
