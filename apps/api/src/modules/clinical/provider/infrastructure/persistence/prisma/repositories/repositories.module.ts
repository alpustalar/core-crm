import { Module } from '@nestjs/common';
import { ProviderRepositoryModule } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/provider/provider.repository.module';
import { ProviderAvailabilityRepositoryModule } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/provider-availability/provider-availability.repository.module';
import { ProviderExceptionRepositoryModule } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/provider-exception/provider-exception.repository.module';
import { ProviderShiftRepositoryModule } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/provider-shift/provider-shift.repository.module';

const Modules = [
  ProviderRepositoryModule,
  ProviderAvailabilityRepositoryModule,
  ProviderExceptionRepositoryModule,
  ProviderShiftRepositoryModule,
];

@Module({
  imports: Modules,
  exports: Modules,
})
export class ProviderRepositoriesModule {}
