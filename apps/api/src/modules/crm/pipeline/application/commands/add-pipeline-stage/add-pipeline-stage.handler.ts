import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { PipelineStage } from '@modules/crm/pipeline/domain/entities/pipeline-stage.entity';
import { PipelineNotFoundException } from '@modules/crm/pipeline/domain/exceptions/pipeline.exceptions';
import { AddPipelineStageCommand } from './add-pipeline-stage.command';
import {
  IPipelineCommandRepository,
  PIPELINE_COMMAND_REPOSITORY,
} from '@modules/crm/pipeline/domain/repositories/pipeline/pipeline.command.repository';
import {
  IPipelineStageCommandRepository,
  PIPELINE_STAGE_COMMAND_REPOSITORY,
} from '@modules/crm/pipeline/domain/repositories/pipeline-stage/pipeline-stage.command.repository';

@CommandHandler(AddPipelineStageCommand)
export class AddPipelineStageHandler
  implements ICommandHandler<AddPipelineStageCommand, string>
{
  constructor(
    @Inject(PIPELINE_COMMAND_REPOSITORY)
    private readonly pipelineRepo: IPipelineCommandRepository,
    @Inject(PIPELINE_STAGE_COMMAND_REPOSITORY)
    private readonly pipelineStageRepo: IPipelineStageCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: AddPipelineStageCommand): Promise<string> {
    const { pipelineId, data } = command.payload;

    const pipeline = await this.pipelineRepo.findById(pipelineId);
    if (!pipeline) throw new PipelineNotFoundException(pipelineId);

    const stage = PipelineStage.create({
      pipelineId,
      name: data.name,
      order: data.order,
      type: data.type,
      color: data.color,
    });

    return this.txManager.run(async () => {
      const saved = await this.pipelineStageRepo.create(stage);
      return saved.id.value;
    });
  }
}
