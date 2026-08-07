import { PROVIDER_EVENTS } from '@src/domain/constants/events';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { SetProviderExaminationCommand } from './set-provider-examination.command';
import { ProviderNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider.exceptions';
import {
  IProviderCommandRepository,
  PROVIDER_COMMAND_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider/provider.command.repository';

@CommandHandler(SetProviderExaminationCommand)
export class SetProviderExaminationHandler
  implements ICommandHandler<SetProviderExaminationCommand, void>
{
  constructor(
    @Inject(PROVIDER_COMMAND_REPOSITORY)
    private readonly providerRepo: IProviderCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(command: SetProviderExaminationCommand): Promise<void> {
    const { providerId, data, ctx } = command.payload;

    const provider = await this.providerRepo.findById(providerId);
    if (!provider) throw new ProviderNotFoundException();

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) =>
        p.actorCanAccessTargetClinic(provider.clinicId.value)
      )
      .orThrow(PROVIDER_EVENTS.EXAMINATION_SET);

    provider.setConsultationAcceptance(data.acceptsConsultation);
    await this.providerRepo.update(provider);
  }
}
