import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import {
  CLINIC_AI_AGENT_CONFIG_COMMAND_REPOSITORY,
  CLINIC_AI_AGENT_CONFIG_QUERY_REPOSITORY,
  IClinicAiAgentConfigCommandRepository,
  IClinicAiAgentConfigQueryRepository,
} from '@modules/messaging/ai-agent/domain/repositories/clinic-ai-agent-config.repository';
import { ClinicAiAgentConfig } from '@modules/messaging/ai-agent/domain/entities/clinic-ai-agent-config.entity';
import { ConfigureClinicAiAgentCommand } from './configure-clinic-ai-agent.command';

@CommandHandler(ConfigureClinicAiAgentCommand)
export class ConfigureClinicAiAgentHandler
  implements ICommandHandler<ConfigureClinicAiAgentCommand, string>
{
  constructor(
    @Inject(CLINIC_AI_AGENT_CONFIG_COMMAND_REPOSITORY)
    private readonly configCommandRepo: IClinicAiAgentConfigCommandRepository,
    @Inject(CLINIC_AI_AGENT_CONFIG_QUERY_REPOSITORY)
    private readonly configQueryRepo: IClinicAiAgentConfigQueryRepository,
    private readonly cipher: TokenCipherService,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ConfigureClinicAiAgentCommand): Promise<string> {
    const { clinicId, input, ctx } = command;

    // apiKey verildiyse şifrele; verilmediyse undefined → mevcut korunur (update) / null (create).
    const encryptedApiKey = input.apiKey
      ? this.cipher.encrypt(input.apiKey)
      : undefined;

    const existing = await this.configQueryRepo.findByClinicId(clinicId);

    const config =
      existing ??
      ClinicAiAgentConfig.create({
        clinicId,
        organizationId: ctx.actor.organizationId!,
      });

    config.updateSettings({
      isEnabled: input.isEnabled,
      model: input.model,
      systemPrompt: input.systemPrompt,
      apiKey: encryptedApiKey,
      maxTokens: input.maxTokens,
      replyOnlyWithinWindow: input.replyOnlyWithinWindow,
    });

    const saved = await this.txManager.run(() =>
      this.configCommandRepo.save(config)
    );
    return saved.id;
  }
}
