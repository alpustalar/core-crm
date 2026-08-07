import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProjectCommandModule } from '@modules/organization/project/application/commands/command.module';
import { ProjectQueryModule } from '@modules/organization/project/application/queries/query.module';
import { ProjectController } from './controllers/project.controller';

@Module({
  imports: [CqrsModule, ProjectCommandModule, ProjectQueryModule],
  controllers: [ProjectController],
})
export class ProjectPresentationModule {}
