import { Module } from '@nestjs/common';
import { LeadPresentationModule } from './presentation/presentation.module';

@Module({ imports: [LeadPresentationModule] })
export class LeadModule {}
