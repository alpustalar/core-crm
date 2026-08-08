import { Module } from '@nestjs/common';
import { PipelinePresentationModule } from './presentation/presentation.module';

@Module({ imports: [PipelinePresentationModule] })
export class PipelineModule {}
