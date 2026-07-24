import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPipelineStageCommandRepository,
  PIPELINE_STAGE_COMMAND_REPOSITORY,
} from '@modules/crm/pipeline/domain/repositories/pipeline.repository';
import { PipelineStageNotFoundException } from '@modules/crm/pipeline/domain/exceptions/pipeline.exceptions';
import { UpdatePipelineStageCommand } from './update-pipeline-stage.command';

@CommandHandler(UpdatePipelineStageCommand)
export class UpdatePipelineStageHandler
  implements ICommandHandler<UpdatePipelineStageCommand, void>
{
  constructor(
    @Inject(PIPELINE_STAGE_COMMAND_REPOSITORY)
    private readonly stageCommandRepo: IPipelineStageCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: UpdatePipelineStageCommand): Promise<void> {
    const { stageId, data } = command.payload;

    const stage = await this.stageCommandRepo.findById(stageId);
    if (!stage) throw new PipelineStageNotFoundException(stageId);

    stage.update({
      name: data.name,
      order: data.order,
      type: data.type,
      color: data.color,
    });

    await this.txManager.run(() => this.stageCommandRepo.save(stage));
  }
}
