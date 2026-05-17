import { ClinicQueryModule } from '@modules/clinic/application/queries/query.module';
import { ClinicCommandModule } from '@modules/clinic/application/commands/command.module';
import { Module } from '@nestjs/common';
import { RedisModule } from '@common/redis/redis.module';
import { ClinicModuleApi } from '@modules/clinic/clinic.module.api';
import { ClinicPresentationModule } from '@modules/clinic/presentation/clinic.presentation.module';
import { ClinicEventModule } from '@modules/clinic/infrastructure/events/clinic-event.module';
import { CLINIC_REPO_TOKEN } from '@modules/clinic/domain/repositories/clinic.repository.interface';
import { ClinicRepository } from '@modules/clinic/infrastructure/persistence/prisma/repositories/clinic.repository';
import { CLINIC_MODULE_API_TOKEN } from '@modules/clinic/domain/interfaces/clinic.module.api.interface';
import { CLINIC_AVAILABILITY_DOMAIN_SERVICE_TOKEN } from '@modules/clinic/domain/interfaces/clinic-availability.domain-service.interface';
import { ClinicAvailabilityDomainService } from '@modules/clinic/domain/services/clinic-availability.domain-service';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    ClinicQueryModule,
    ClinicCommandModule,
    RedisModule,
    ClinicPresentationModule,
    ClinicEventModule,
    CqrsModule,
  ],
  providers: [
    {
      provide: CLINIC_REPO_TOKEN,
      useClass: ClinicRepository,
    },
    {
      provide: CLINIC_AVAILABILITY_DOMAIN_SERVICE_TOKEN,
      useClass: ClinicAvailabilityDomainService,
    },
    {
      provide: CLINIC_MODULE_API_TOKEN,
      useClass: ClinicModuleApi,
    },
  ],
  exports: [CLINIC_MODULE_API_TOKEN, CLINIC_AVAILABILITY_DOMAIN_SERVICE_TOKEN],
})
export class ClinicModule {}
