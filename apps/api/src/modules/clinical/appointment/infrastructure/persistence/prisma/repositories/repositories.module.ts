import { Module } from '@nestjs/common';
import { AppointmentRepositoryModule } from '@modules/clinical/appointment/infrastructure/persistence/prisma/repositories/appointment/appointment.repository.module';

const RepositoriesModules = [AppointmentRepositoryModule];
@Module({
  imports: [...RepositoriesModules],
  exports: RepositoriesModules,
})
export class AppointmentRepositoriesModule {}
