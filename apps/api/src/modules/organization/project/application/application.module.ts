import { Module } from '@nestjs/common';
import { ProjectQueryModule } from '@modules/organization/project/application/queries/query.module';
import { ProjectCommandModule } from '@modules/organization/project/application/commands/command.module';

const ApplicationModules = [ProjectQueryModule, ProjectCommandModule];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class ProjectApplicationModule {}
