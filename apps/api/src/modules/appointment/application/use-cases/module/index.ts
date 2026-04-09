import { Module } from '@nestjs/common';
import { SoftDeleteAppointmentsForCascadeUseCase } from '@modules/appointment/application/use-cases';

const UseCases = [SoftDeleteAppointmentsForCascadeUseCase];
@Module({
  providers: [...UseCases],
  exports: [...UseCases],
})
export class AppointmentUseCaseModule {}
