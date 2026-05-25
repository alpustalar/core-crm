import { ClinicQueryModule } from '@modules/clinic/application/queries/query.module';
import { ClinicCommandModule } from '@modules/clinic/application/commands/command.module';
import { Module } from '@nestjs/common';
import { RedisModule } from '@common/redis/redis.module';
import { ClinicPresentationModule } from '@modules/clinic/presentation/clinic.presentation.module';
import { ClinicEventModule } from '@modules/clinic/infrastructure/events/clinic-event.module';

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
