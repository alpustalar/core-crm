import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MoveLeadToStageCommand } from './move-lead-to-stage.command';
import {
  ILeadCommandRepository,
  LEAD_COMMAND_REPOSITORY,
} from '@modules/crm/lead/domain/repositories/lead/lead.command.repository';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { LeadNotFoundException } from '@modules/crm/lead/domain/exceptions/lead.exceptions';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetPipelineStageByIdQuery } from '@modules/crm/pipeline/application/queries/get-pipeline-stage-by-id/get-pipeline-stage-by-id.query';
import { PipelineStageNotFoundException } from '@modules/crm/pipeline/domain/exceptions/pipeline.exceptions';

@CommandHandler(MoveLeadToStageCommand)
export class MoveLeadToStageHandler
  implements ICommandHandler<MoveLeadToStageCommand, void>
{
  constructor(
    @Inject(LEAD_COMMAND_REPOSITORY)
    private readonly leadRepo: ILeadCommandRepository,
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
      const lead = await this.leadRepo.findByIdForUpdate(leadId);
      if (!lead) throw new LeadNotFoundException();

      // "Statü değişti mi" kararı entity'nin: aşama taşıma statüyü değiştirmeyebilir
      // (OPEN→OPEN) ve o durumda event fırlatılmaz.
      lead.moveToStage({
        pipelineId: stage.pipelineId,
        stageId: stage.id,
        stageType: stage.type,
        stageName: stage.name,
        reason: data.reason,
        actorId: actor.userId,
        logSource: actor.source,
      });

      await this.leadRepo.update(lead);
    });
  }
}
