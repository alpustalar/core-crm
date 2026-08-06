import { Module } from '@nestjs/common';
import { ConsentFormEventModule } from '@modules/clinical/consent-form/infrastructure/events/consent-form-event.module';
import { ConsentFormRepositoryModule } from '@modules/clinical/consent-form/infrastructure/persistence/prisma/repositories/consent-form.repository.module';

const InfrastructureModules = [
  ConsentFormEventModule,
  ConsentFormRepositoryModule,
];
@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class ConsentFormInfrastructureModule {}
