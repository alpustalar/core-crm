import {
  CLINIC_COMMAND_REPOSITORY,
  IClinicCommandRepository,
} from '@modules/organization/clinic/domain/repositories/clinic.repository.interface';
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
import { CreateClinicProps } from '@modules/organization/clinic/domain/clinic.contracts';

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

    const organizationId =
      internalRelations?.organizationId ?? dto.organizationId;
    const props: CreateClinicProps = {
      ...dto,
      organizationId,
      id: internalRelations?.clinicId,
    };

    const { evaluator } = this.policyFactory.organization(actor);
    if (organizationId) {
      evaluator
        .bypassIf(ExecutionPolicy.isSystemInitiated(source))
        .check((p) => p.isOwnOrganization(organizationId), 'Yetki ihlali')
        .orThrow(CLINIC_EVENTS.CREATED);
    }

    const actorId = ExecutionPolicy.isUserInitiated(source)
      ? actor.userId
      : undefined;
    return this.persistClinic(props, actorId);
  }

  private async persistClinic(props: CreateClinicProps, actorId?: string) {
    const clinic = Clinic.create(props, actorId);
    const saved = await this.clinicCommandRepo.save(clinic);
    return saved.id;
  }
}
