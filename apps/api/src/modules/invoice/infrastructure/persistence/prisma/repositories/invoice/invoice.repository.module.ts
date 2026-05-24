import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import {
  INVOICE_COMMAND_REPOSITORY,
  INVOICE_QUERY_REPOSITORY,
} from '@modules/invoice/domain/repositories/invoice.repository';
import { InvoiceCommandRepository } from './invoice.command.repository';
import { InvoiceQueryRepository } from './invoice.query.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: INVOICE_COMMAND_REPOSITORY, useClass: InvoiceCommandRepository },
    { provide: INVOICE_QUERY_REPOSITORY, useClass: InvoiceQueryRepository },
  ],
  exports: [INVOICE_COMMAND_REPOSITORY, INVOICE_QUERY_REPOSITORY],
})
export class InvoiceRepositoryModule {}
