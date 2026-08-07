import { Module } from '@nestjs/common';
import { ConsentFormEventModule } from '@modules/clinical/consent-form/infrastructure/events/consent-form-event.module';
import { ConsentFormRepositoriesModule } from '@modules/clinical/consent-form/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [
  ConsentFormEventModule,
  ConsentFormRepositoriesModule,
];
@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class ConsentFormInfrastructureModule {}
