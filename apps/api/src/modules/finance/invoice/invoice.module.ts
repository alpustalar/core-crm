import { Module } from '@nestjs/common';
import { InvoicePresentationModule } from './presentation/presentation.module';

@Module({ imports: [InvoicePresentationModule] })
export class InvoiceModule {}
