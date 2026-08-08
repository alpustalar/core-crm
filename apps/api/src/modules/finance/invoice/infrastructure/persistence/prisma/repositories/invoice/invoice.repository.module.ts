import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { InvoiceCommandRepository } from './invoice.command.repository';
import { InvoiceQueryRepository } from './invoice.query.repository';
import { INVOICE_COMMAND_REPOSITORY } from '@modules/finance/invoice/domain/repositories/invoice/invoice.command.repository';
import { INVOICE_QUERY_REPOSITORY } from '@modules/finance/invoice/domain/repositories/invoice/invoice.query.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: INVOICE_COMMAND_REPOSITORY, useClass: InvoiceCommandRepository },
    { provide: INVOICE_QUERY_REPOSITORY, useClass: InvoiceQueryRepository },
  ],
  exports: [INVOICE_COMMAND_REPOSITORY, INVOICE_QUERY_REPOSITORY],
})
export class InvoiceRepositoryModule {}
