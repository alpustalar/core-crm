import { Module } from '@nestjs/common';
import { TransferCommandModule } from './application/commands/command.module';
import { TransferQueryModule } from './application/queries/query.module';
import { TransferAiToolsModule } from './application/ai-tools/transfer-ai-tools.module';

@Module({
  imports: [
    TransferCommandModule,
    TransferQueryModule,
    TransferAiToolsModule,
  ],
  exports: [TransferCommandModule, TransferQueryModule],
})
export class TransferModule {}
