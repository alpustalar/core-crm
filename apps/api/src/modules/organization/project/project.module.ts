import { Module } from '@nestjs/common';
import { ProjectPresentationModule } from './presentation/project.presentation.module';
import { ProjectCommandModule } from './application/commands/command.module';
import { ProjectQueryModule } from './application/queries/query.module';

@Module({
  imports: [
    ProjectPresentationModule,
    ProjectCommandModule,
    ProjectQueryModule,
  ],
  exports: [ProjectCommandModule, ProjectQueryModule],
})
export class ProjectModule {}
