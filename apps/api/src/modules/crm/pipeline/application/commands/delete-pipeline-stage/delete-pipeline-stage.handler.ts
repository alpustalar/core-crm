import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { PipelineStageNotFoundException } from '@modules/crm/pipeline/domain/exceptions/pipeline.exceptions';
import { DeletePipelineStageCommand } from './delete-pipeline-stage.command';
import {
  IPipelineStageCommandRepository,
  PIPELINE_STAGE_COMMAND_REPOSITORY,
} from '@modules/crm/pipeline/domain/repositories/pipeline-stage/pipeline-stage.command.repository';

@CommandHandler(DeletePipelineStageCommand)
export class DeletePipelineStageHandler
  implements ICommandHandler<DeletePipelineStageCommand, void>
{
  constructor(
    @Inject(PIPELINE_STAGE_COMMAND_REPOSITORY)
    private readonly stageRepo: IPipelineStageCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: DeletePipelineStageCommand): Promise<void> {
    const { stageId } = command;

    const stage = await this.stageRepo.findById(stageId);
    if (!stage) throw new PipelineStageNotFoundException(stageId);

    stage.softDelete();
    await this.txManager.run(() => this.stageRepo.update(stage));
  }
}
