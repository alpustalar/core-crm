import { Module } from '@nestjs/common';
import { PipelineController } from '@modules/crm/pipeline/presentation/http/controllers/pipeline.controller';

@Module({ controllers: [PipelineController] })
export class PipelinePresentationModule {}
