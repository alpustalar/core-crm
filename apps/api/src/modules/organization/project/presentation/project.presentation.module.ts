import { Module } from '@nestjs/common';
import { ProjectController } from './controllers/project.controller';
import { ProjectApplicationModule } from '@modules/organization/project/application/application.module';

@Module({
  imports: [ProjectApplicationModule],
  controllers: [ProjectController],
})
export class ProjectPresentationModule {}
