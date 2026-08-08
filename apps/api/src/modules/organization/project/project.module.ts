import { Module } from '@nestjs/common';
import { ProjectPresentationModule } from './presentation/project.presentation.module';

@Module({ imports: [ProjectPresentationModule] })
export class ProjectModule {}
