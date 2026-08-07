import { Module } from '@nestjs/common';
import { JournalRepositoryModule } from '@modules/finance/accounting/posting/infrastructure/persistence/prisma/repositories/journal/journal.repository.module';

const RepositoriesModules = [JournalRepositoryModule];
@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class PostingRepositoriesModule {}
