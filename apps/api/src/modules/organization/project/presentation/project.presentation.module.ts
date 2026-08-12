import { Module } from '@nestjs/common';
import { ProjectQueryController } from './controllers/project.query.controller';
import { ProjectCommandController } from './controllers/project.command.controller';
import { ProjectApplicationModule } from '@modules/organization/project/application/application.module';

@Module({
  imports: [ProjectApplicationModule],
  controllers: [ProjectQueryController, ProjectCommandController],
})
export class ProjectPresentationModule {}
