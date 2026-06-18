import { Module } from '@nestjs/common';
import { PostFinancialEventHandler } from './post-financial-event/post-financial-event.handler';
import { ReverseJournalEntryHandler } from './reverse-journal-entry/reverse-journal-entry.handler';
import { JournalRepositoryModule } from '@modules/finance/accounting/posting/infrastructure/persistence/prisma/repositories/journal/journal.repository.module';
import { POSTING_RULES } from '@modules/finance/accounting/posting/domain/posting/posting-rule.interface';
import { PostingRuleRegistry } from '@modules/finance/accounting/posting/domain/posting/posting-rule.registry';
import { PaymentReceivedRule } from '@modules/finance/accounting/posting/domain/posting/rules/payment-received.rule';
import { SalesInvoiceIssuedRule } from '@modules/finance/accounting/posting/domain/posting/rules/sales-invoice-issued.rule';
import { PurchaseInvoiceReceivedRule } from '@modules/finance/accounting/posting/domain/posting/rules/purchase-invoice-received.rule';
import { PayrollAccruedRule } from '@modules/finance/accounting/posting/domain/posting/rules/payroll-accrued.rule';

const CommandHandlers = [PostFinancialEventHandler, ReverseJournalEntryHandler];

@Module({
  imports: [JournalRepositoryModule],
  providers: [
    ...CommandHandlers,
    PaymentReceivedRule,
    SalesInvoiceIssuedRule,
    PurchaseInvoiceReceivedRule,
    PayrollAccruedRule,
    {
      provide: POSTING_RULES,
      useFactory: (
        paymentReceived: PaymentReceivedRule,
        salesInvoiceIssued: SalesInvoiceIssuedRule,
        purchaseInvoiceReceived: PurchaseInvoiceReceivedRule,
        payrollAccrued: PayrollAccruedRule
      ) => [
        paymentReceived,
        salesInvoiceIssued,
        purchaseInvoiceReceived,
        payrollAccrued,
      ],
      inject: [
        PaymentReceivedRule,
        SalesInvoiceIssuedRule,
        PurchaseInvoiceReceivedRule,
        PayrollAccruedRule,
      ],
    },
    PostingRuleRegistry,
  ],
  exports: [...CommandHandlers],
})
export class PostingCommandModule {}
