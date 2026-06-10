import { Module } from '@nestjs/common';
import { PostingCommandModule } from './application/commands/command.module';
import { PostingQueryModule } from './application/queries/query.module';
import { PostingPresentationModule } from './presentation/posting-presentation.module';
import { FinancialEventRecordedListener } from './infrastructure/events/listeners/financial-event-recorded.listener';

@Module({
  imports: [
    PostingCommandModule,
    PostingQueryModule,
    PostingPresentationModule,
  ],
  providers: [FinancialEventRecordedListener],
  exports: [PostingCommandModule, PostingQueryModule],
})
export class PostingModule {}
