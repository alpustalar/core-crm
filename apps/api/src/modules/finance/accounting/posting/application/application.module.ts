import { Module } from '@nestjs/common';
import { PostingCommandModule } from '@modules/finance/accounting/posting/application/commands/command.module';
import { PostingQueryModule } from '@modules/finance/accounting/posting/application/queries/query.module';

const ApplicationModules = [PostingCommandModule, PostingQueryModule];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class PostingApplicationModule {}
