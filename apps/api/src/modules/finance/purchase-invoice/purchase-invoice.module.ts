import { Module } from '@nestjs/common';
import { PurchaseInvoicePresentationModule } from './presentation/presentation.module';

@Module({ imports: [PurchaseInvoicePresentationModule] })
export class PurchaseInvoiceModule {}
