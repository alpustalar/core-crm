import {
  CLINIC_EVENT_PUBLISHER,
  IClinicEventPublisher,
} from '@modules/organization/clinic/domain/interfaces/clinic.event-publisher.interface';
import {
  CLINIC_COMMAND_REPOSITORY,
  IClinicCommandRepository,
} from '@modules/organization/clinic/domain/repositories/clinic.repository.interface';
import { CreateClinicProps } from '@modules/organization/clinic/domain/types/create-clinic.props';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { CreateClinicCommand } from './create-clinic.command';

@CommandHandler(CreateClinicCommand)
export class CreateClinicHandler
  implements ICommandHandler<CreateClinicCommand, string>
{
  constructor(
    @Inject(CLINIC_COMMAND_REPOSITORY)
    private readonly clinicCommandRepo: IClinicCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(CLINIC_EVENT_PUBLISHER)
    private readonly clinicEventPublisher: IClinicEventPublisher
  ) {}

  async execute(command: CreateClinicCommand) {
    const { dto, ctx, internalRelations } = command;
    const { actor, source } = ctx;

    if (ExecutionPolicy.isSystemInitiated(source)) {
      const { organizationId: dtoOrganizationId, ...restClinicDto } = dto;

      const organizationId =
        internalRelations?.organizationId ?? dtoOrganizationId;
      const clinicId = internalRelations?.clinicId;

      const clinicDto: CreateClinicProps = {
        ...restClinicDto,
        organizationId,
        id: clinicId,
      };

      const clinicRaw = await this.clinicCommandRepo.create(clinicDto);
      return clinicRaw.id;
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

    const clinic = await this.clinicCommandRepo.create(dto);
    return clinic.id;
  }
}
