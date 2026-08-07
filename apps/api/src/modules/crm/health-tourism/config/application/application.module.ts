import { Module } from '@nestjs/common';
import { HealthTourismConfigQueryModule } from '@modules/crm/health-tourism/config/application/queries/query.module';
import { HealthTourismConfigCommandModule } from '@modules/crm/health-tourism/config/application/commands/command.module';

const ApplicationModules = [
  HealthTourismConfigQueryModule,
  HealthTourismConfigCommandModule,
];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class HealthTourismConfigApplicationModule {}
