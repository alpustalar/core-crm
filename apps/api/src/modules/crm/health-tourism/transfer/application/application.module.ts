import { Module } from '@nestjs/common';
import { TransferAiToolsModule } from '@modules/crm/health-tourism/transfer/application/ai-tools/transfer-ai-tools.module';
import { TransferCommandModule } from '@modules/crm/health-tourism/transfer/application/commands/command.module';
import { TransferQueryModule } from '@modules/crm/health-tourism/transfer/application/queries/query.module';

const ApplicationModules = [
  TransferAiToolsModule,
  TransferCommandModule,
  TransferQueryModule,
];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class TransferApplicationModule {}
