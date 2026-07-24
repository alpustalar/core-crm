import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MoveLeadToStageCommand } from './move-lead-to-stage.command';
import {
  ILeadCommandRepository,
  LEAD_COMMAND_REPOSITORY,
} from '@modules/crm/lead/domain/repositories/lead.repository.interface';
import {
  ILeadEventPublisher,
  LEAD_EVENT_PUBLISHER,
} from '@modules/crm/lead/domain/interfaces/lead-event-publisher.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { LeadNotFoundException } from '@modules/crm/lead/domain/exceptions/lead.exceptions';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetPipelineStageByIdQuery } from '@modules/crm/pipeline/application/queries/get-pipeline-stage-by-id/get-pipeline-stage-by-id.query';
import { PipelineStageNotFoundException } from '@modules/crm/pipeline/domain/exceptions/pipeline.exceptions';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';

@CommandHandler(MoveLeadToStageCommand)
export class MoveLeadToStageHandler
  implements ICommandHandler<MoveLeadToStageCommand, void>
{
  constructor(
    @Inject(LEAD_COMMAND_REPOSITORY)
    private readonly leadCommandRepo: ILeadCommandRepository,
    @Inject(LEAD_EVENT_PUBLISHER)
    private readonly eventPublisher: ILeadEventPublisher,
    private readonly queryBus: TSQueryBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: MoveLeadToStageCommand): Promise<void> {
    const { leadId, data, ctx } = command.payload;
    const { actor } = ctx;

    // Hedef aşamayı çöz (tip + huni) — cross-module yalnız QueryBus ile.
    const { data: stage } = await this.queryBus.execute(
      new GetPipelineStageByIdQuery(data.stageId, ctx)
    );
    if (!stage) throw new PipelineStageNotFoundException(data.stageId);

    await this.txManager.run(async () => {
      const lead = await this.leadCommandRepo.findById(leadId);
      if (!lead) throw new LeadNotFoundException();

      const previousStatus = lead.status;

      lead.moveToStage({
        pipelineId: stage.pipelineId,
        stageId: stage.id,
        stageType: stage.type,
        reason: data.reason,
      });

      const saved = await this.leadCommandRepo.save(lead);

      if (saved.status !== previousStatus) {
        this.eventPublisher.leadStatusChanged({
          leadId: saved.id.value,
          clinicId: saved.clinicId.value,
          previousStatus,
          newStatus: saved.status,
          actorId: actor.userId,
          source: actor.source,
          action: LogAction.LEAD_STATUS_CHANGED,
          type: LogType.INFO,
          details: `Lead aşama taşındı (${stage.name}): ${previousStatus} -> ${saved.status}`,
        });
      }
    });
  }
}
