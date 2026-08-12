import { Module } from '@nestjs/common';
import { PipelineQueryController } from '@modules/crm/pipeline/presentation/http/controllers/pipeline.query.controller';
import { PipelineCommandController } from '@modules/crm/pipeline/presentation/http/controllers/pipeline.command.controller';

@Module({ controllers: [PipelineQueryController, PipelineCommandController] })
export class PipelinePresentationModule {}
