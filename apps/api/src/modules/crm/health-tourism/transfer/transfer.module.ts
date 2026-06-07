import { Module } from '@nestjs/common';
import { TransferCommandModule } from './application/commands/command.module';
import { TransferQueryModule } from './application/queries/query.module';

@Module({
  imports: [TransferCommandModule, TransferQueryModule],
  exports: [TransferCommandModule, TransferQueryModule],
})
export class TransferModule {}
