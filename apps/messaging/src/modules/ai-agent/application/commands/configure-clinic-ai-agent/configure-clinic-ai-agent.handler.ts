import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MongoTransactionManager } from '@src/infrastructure/persistence/mongo/mongo-transaction.manager';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import {
  CLINIC_AI_AGENT_CONFIG_COMMAND_REPOSITORY,
  IClinicAiAgentConfigCommandRepository,
} from '@modules/ai-agent/domain/repositories/clinic-ai-agent-config.repository';
import { ClinicAiAgentConfig } from '@modules/ai-agent/domain/entities/clinic-ai-agent-config.entity';
import { ConfigureClinicAiAgentCommand } from './configure-clinic-ai-agent.command';

@CommandHandler(ConfigureClinicAiAgentCommand)
export class ConfigureClinicAiAgentHandler implements ICommandHandler<
  ConfigureClinicAiAgentCommand,
  string
> {
  constructor(
    @Inject(CLINIC_AI_AGENT_CONFIG_COMMAND_REPOSITORY)
    private readonly configCommandRepo: IClinicAiAgentConfigCommandRepository,
    private readonly cipher: TokenCipherService,
    private readonly txManager: MongoTransactionManager
  ) {}

  async execute(command: ConfigureClinicAiAgentCommand): Promise<string> {
    const { clinicId, input, ctx } = command.payload;

    // apiKey verildiyse şifrele; verilmediyse undefined → mevcut korunur (update) / null (create).
    const encryptedApiKey = input.apiKey
      ? this.cipher.encrypt(input.apiKey)
      : undefined;

    const existing = await this.configCommandRepo.findByClinicId(clinicId);

    const config =
      existing ??
      ClinicAiAgentConfig.create({
        clinicId,
        organizationId: ctx.actor.organizationId!,
      });

    config.updateSettings({
      isEnabled: input.isEnabled,
      provider: input.provider,
      model: input.model,
      systemPrompt: input.systemPrompt,
      apiKey: encryptedApiKey,
      maxTokens: input.maxTokens,
      replyOnlyWithinWindow: input.replyOnlyWithinWindow,
    });

    const saved = await this.txManager.run(() =>
      this.configCommandRepo.upsertByClinicId(config)
    );
    return saved.id.value;
  }
}
