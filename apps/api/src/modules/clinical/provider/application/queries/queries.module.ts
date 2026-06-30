import { Module } from '@nestjs/common';

// Query Handlers
import { FindAllProvidersHandler } from './find-all-providers/find-all-providers.handler';
import { GetProviderScheduleHandler } from './get-provider-schedule/get-provider-schedule.handler';

import { FindProvidersDirectoryHandler } from './find-providers-directory/find-providers-directory.handler';
import { ProviderRepositoriesModule } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/repositories.module';
import { AssertProviderCanBookHandler } from '@modules/clinical/provider/application/queries/assert-provider-can-book/assert-provider-can-book.handler';

const QueryHandlers = [
  FindAllProvidersHandler,
  GetProviderScheduleHandler,
  AssertProviderCanBookHandler,
  FindProvidersDirectoryHandler,
];

@Module({
  imports: [ProviderRepositoriesModule],
  providers: QueryHandlers,
  exports: QueryHandlers,
})
export class ProviderQueriesModule {}
