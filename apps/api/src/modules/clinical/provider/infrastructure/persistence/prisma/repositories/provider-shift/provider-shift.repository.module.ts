import { Module } from '@nestjs/common';

import { ProviderShiftCommandRepository } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/provider-shift/provider-shift.command.repository';
import { ProviderShiftQueryRepository } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/provider-shift/provider-shift.query.repository';
import { PROVIDER_SHIFT_COMMAND_REPOSITORY } from '@modules/clinical/provider/domain/repositories/provider-shift/provider-shift.command.repository';
import { PROVIDER_SHIFT_QUERY_REPOSITORY } from '@modules/clinical/provider/domain/repositories/provider-shift/provider-shift.query.repository';

@Module({
  providers: [
    {
      provide: PROVIDER_SHIFT_COMMAND_REPOSITORY,
      useClass: ProviderShiftCommandRepository,
    },
    {
      provide: PROVIDER_SHIFT_QUERY_REPOSITORY,
      useClass: ProviderShiftQueryRepository,
    },
  ],
  exports: [PROVIDER_SHIFT_COMMAND_REPOSITORY, PROVIDER_SHIFT_QUERY_REPOSITORY],
})
export class ProviderShiftRepositoryModule {}
