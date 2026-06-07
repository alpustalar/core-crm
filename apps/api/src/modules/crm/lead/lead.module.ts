import { Module } from '@nestjs/common';
import { LeadPresentationModule } from './presentation/lead.presentation.module';

@Module({
  imports: [LeadPresentationModule],
})
export class LeadModule {}
