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
import { CLINIC_EVENTS } from '@src/domain/constants/events';
import { Clinic } from '@modules/organization/clinic/domain/entities/clinic.entity';

@CommandHandler(CreateClinicCommand)
export class CreateClinicHandler
  implements ICommandHandler<CreateClinicCommand, string>
{
  constructor(
    @Inject(CLINIC_COMMAND_REPOSITORY)
    private readonly clinicCommandRepo: IClinicCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
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

      return this.persistClinic(clinicDto);
    }

    const { organizationId } = dto;

    const { evaluator } = this.policyFactory.organization(actor);

    if (organizationId) {
      evaluator
        .check((p) => p.isOwnOrganization(organizationId), 'Yetki ihlali')
        .orThrow(CLINIC_EVENTS.CREATED);
    }

    return this.persistClinic(dto, actor.userId);
  }

  private async persistClinic(props: CreateClinicProps, actorId?: string) {
    const clinic = Clinic.create(props, actorId);
    const saved = await this.clinicCommandRepo.save(clinic);
    return saved.id;
  }
}
