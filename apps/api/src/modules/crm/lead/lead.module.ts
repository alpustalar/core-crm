import { Module } from '@nestjs/common';
import { LeadPresentationModule } from './presentation/lead.presentation.module';
import { LeadAiToolsModule } from './application/ai-tools/lead-ai-tools.module';

@Module({
  imports: [LeadPresentationModule, LeadAiToolsModule],
})
export class LeadModule {}
