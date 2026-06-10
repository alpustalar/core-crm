import { Module } from '@nestjs/common';
import { JournalController } from './controllers/journal.controller';
import { PostingQueryModule } from '@modules/finance/accounting/posting/application/queries/query.module';

@Module({
  imports: [PostingQueryModule],
  controllers: [JournalController],
})
export class PostingPresentationModule {}
