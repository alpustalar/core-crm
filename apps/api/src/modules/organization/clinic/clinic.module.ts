import { ClinicQueryModule } from '@modules/organization/clinic/application/queries/query.module';
import { ClinicCommandModule } from '@modules/organization/clinic/application/commands/command.module';
import { Module } from '@nestjs/common';
import { RedisModule } from '@src/infrastructure/cache/redis/redis.module';
import { ClinicPresentationModule } from '@modules/organization/clinic/presentation/clinic.presentation.module';
import { ClinicEventModule } from '@modules/organization/clinic/infrastructure/events/clinic-event.module';

@Module({
  imports: [
    ClinicQueryModule,
    ClinicCommandModule,
    RedisModule,
    ClinicPresentationModule,
    ClinicEventModule,
  ],
})
export class ClinicModule {}
