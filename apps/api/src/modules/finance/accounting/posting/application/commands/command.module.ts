import { Module } from '@nestjs/common';
import { PostFinancialEventHandler } from './post-financial-event/post-financial-event.handler';
import { JournalRepositoryModule } from '@modules/finance/accounting/posting/infrastructure/persistence/prisma/repositories/journal/journal.repository.module';
import { POSTING_RULES } from '@modules/finance/accounting/posting/domain/posting/posting-rule.interface';
import { PostingRuleRegistry } from '@modules/finance/accounting/posting/domain/posting/posting-rule.registry';
import { PaymentReceivedRule } from '@modules/finance/accounting/posting/domain/posting/rules/payment-received.rule';
import { SalesInvoiceIssuedRule } from '@modules/finance/accounting/posting/domain/posting/rules/sales-invoice-issued.rule';

const CommandHandlers = [PostFinancialEventHandler];

@Module({
  imports: [JournalRepositoryModule],
  providers: [
    ...CommandHandlers,
    PaymentReceivedRule,
    SalesInvoiceIssuedRule,
    {
      provide: POSTING_RULES,
      useFactory: (
        paymentReceived: PaymentReceivedRule,
        salesInvoiceIssued: SalesInvoiceIssuedRule
      ) => [paymentReceived, salesInvoiceIssued],
      inject: [PaymentReceivedRule, SalesInvoiceIssuedRule],
    },
    PostingRuleRegistry,
  ],
  exports: [...CommandHandlers],
})
export class PostingCommandModule {}
