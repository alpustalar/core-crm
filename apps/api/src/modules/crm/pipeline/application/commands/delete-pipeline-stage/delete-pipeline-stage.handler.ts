import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPipelineStageCommandRepository,
  PIPELINE_STAGE_COMMAND_REPOSITORY,
} from '@modules/crm/pipeline/domain/repositories/pipeline.repository';
import { PipelineStageNotFoundException } from '@modules/crm/pipeline/domain/exceptions/pipeline.exceptions';
import { DeletePipelineStageCommand } from './delete-pipeline-stage.command';

@CommandHandler(DeletePipelineStageCommand)
export class DeletePipelineStageHandler implements ICommandHandler<
  DeletePipelineStageCommand,
  void
> {
  constructor(
    @Inject(PIPELINE_STAGE_COMMAND_REPOSITORY)
    private readonly stageCommandRepo: IPipelineStageCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: DeletePipelineStageCommand): Promise<void> {
    const { stageId } = command;

    const stage = await this.stageCommandRepo.findById(stageId);
    if (!stage) throw new PipelineStageNotFoundException(stageId);

    stage.softDelete();
    await this.txManager.run(() => this.stageCommandRepo.update(stage));
  }
}
