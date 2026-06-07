import { Module } from '@nestjs/common';
import { HealthTourismController } from './controllers/health-tourism.controller';
import { HealthTourismCommandModule } from '../application/commands/command.module';
import { HealthTourismQueryModule } from '../application/queries/query.module';

@Module({
  imports: [HealthTourismCommandModule, HealthTourismQueryModule],
  controllers: [HealthTourismController],
})
export class HealthTourismPresentationModule {}
