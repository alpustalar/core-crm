import { Module } from '@nestjs/common';
import { AppointmentCheckerService } from '@modules/clinical/appointment/domain/services/appointment-checker/appointment-checker.service';
import { AppointmentRepositoriesModule } from '@modules/clinical/appointment/infrastructure/persistence/prisma/repositories/repositories.module';
import { APPOINTMENT_CHECKER_SERVICE } from '@modules/clinical/appointment/domain/services/appointment-checker/appointment-checker.service.interface';

@Module({
  imports: [AppointmentRepositoriesModule],
  providers: [
    {
      provide: APPOINTMENT_CHECKER_SERVICE,
      useClass: AppointmentCheckerService,
    },
  ],
  exports: [APPOINTMENT_CHECKER_SERVICE],
})
export class AppointmentDomainServicesModule {}
