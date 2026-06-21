import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  CLINIC_AI_AGENT_CONFIG_COMMAND_REPOSITORY,
  CLINIC_AI_AGENT_CONFIG_QUERY_REPOSITORY,
  IClinicAiAgentConfigCommandRepository,
  IClinicAiAgentConfigQueryRepository,
} from '@modules/messaging/ai-agent/domain/repositories/clinic-ai-agent-config.repository';
import { SetClinicAiAgentEnabledCommand } from './set-clinic-ai-agent-enabled.command';

@CommandHandler(SetClinicAiAgentEnabledCommand)
export class SetClinicAiAgentEnabledHandler
  implements ICommandHandler<SetClinicAiAgentEnabledCommand, void>
{
  constructor(
    @Inject(CLINIC_AI_AGENT_CONFIG_COMMAND_REPOSITORY)
    private readonly configCommandRepo: IClinicAiAgentConfigCommandRepository,
    @Inject(CLINIC_AI_AGENT_CONFIG_QUERY_REPOSITORY)
    private readonly configQueryRepo: IClinicAiAgentConfigQueryRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: SetClinicAiAgentEnabledCommand): Promise<void> {
    const config = await this.configQueryRepo.findByClinicId(command.clinicId);
    if (!config) {
      throw new NotFoundException('AI asistan config bulunamadı; önce yapılandırın.');
    }

    if (command.enabled) config.enable();
    else config.disable();

    await this.txManager.run(() => this.configCommandRepo.save(config));
  }
}
