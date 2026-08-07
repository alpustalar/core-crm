import { Module } from '@nestjs/common';
import { LeadCommandModule } from '@modules/crm/lead/application/commands/command.module';
import { LeadQueryModule } from '@modules/crm/lead/application/queries/query.module';
import { LeadAiToolsModule } from '@modules/crm/lead/application/ai-tools/lead-ai-tools.module';

const ApplicationModules = [
  LeadCommandModule,
  LeadQueryModule,
  LeadAiToolsModule,
];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class LeadApplicationModule {}
