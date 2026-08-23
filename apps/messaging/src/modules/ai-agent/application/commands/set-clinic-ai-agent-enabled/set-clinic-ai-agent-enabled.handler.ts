import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {Inject} from '@nestjs/common';
import {AiAgentConfigNotFoundException} from '@modules/ai-agent/domain/exceptions/ai-agent.exceptions';
import {MongoTransactionManager} from '@src/infrastructure/persistence/mongo/mongo-transaction.manager';
import {
    CLINIC_AI_AGENT_CONFIG_COMMAND_REPOSITORY,
    IClinicAiAgentConfigCommandRepository,
} from '@modules/ai-agent/domain/repositories/clinic-ai-agent-config.repository';
import {SetClinicAiAgentEnabledCommand} from './set-clinic-ai-agent-enabled.command';

@CommandHandler(SetClinicAiAgentEnabledCommand)
export class SetClinicAiAgentEnabledHandler implements ICommandHandler<
    SetClinicAiAgentEnabledCommand,
    void
> {
    constructor(
        @Inject(CLINIC_AI_AGENT_CONFIG_COMMAND_REPOSITORY)
        private readonly clinicAiAgentConfigRepo: IClinicAiAgentConfigCommandRepository,
        private readonly txManager: MongoTransactionManager
    ) {
    }

    async execute(command: SetClinicAiAgentEnabledCommand): Promise<void> {
        const {payload} = command;
        const config = await this.clinicAiAgentConfigRepo.findByClinicId(
            payload.clinicId
        );
        if (!config) {
            throw new AiAgentConfigNotFoundException();
        }

        if (payload.enabled) config.enable();
        else config.disable();

        await this.txManager.run(() =>
            this.clinicAiAgentConfigRepo.upsertByClinicId(config)
        );
    }
}
