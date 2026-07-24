import { ClinicQueryModule } from '@modules/organization/clinic/application/queries/query.module';
import { ClinicCommandModule } from '@modules/organization/clinic/application/commands/command.module';
import { Module } from '@nestjs/common';
import { ClinicPresentationModule } from '@modules/organization/clinic/presentation/clinic.presentation.module';
import { ClinicEventModule } from '@modules/organization/clinic/infrastructure/events/clinic-event.module';
import { ClinicCacheService } from '@modules/organization/clinic/infrastructure/cache/clinic-cache.service';

@Module({
  imports: [
    ClinicQueryModule,
    ClinicCommandModule,
    ClinicPresentationModule,
    ClinicEventModule,
  ],
  providers: [ClinicCacheService],
})
export class ClinicModule {}
