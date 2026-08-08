import { Module } from '@nestjs/common';
import { PostFinancialEventHandler } from './post-financial-event/post-financial-event.handler';
import { ReverseJournalEntryHandler } from './reverse-journal-entry/reverse-journal-entry.handler';
import { GenerateYearEndClosingHandler } from './generate-year-end-closing/generate-year-end-closing.handler';
import { JournalRepositoryModule } from '@modules/finance/accounting/posting/infrastructure/persistence/prisma/repositories/journal/journal.repository.module';
import { POSTING_RULES } from '@modules/finance/accounting/posting/domain/posting/posting-rule.interface';
import { PostingRuleRegistry } from '@modules/finance/accounting/posting/domain/posting/posting-rule.registry';
import { PaymentReceivedRule } from '@modules/finance/accounting/posting/domain/posting/rules/payment-received.rule';
import { SalesInvoiceIssuedRule } from '@modules/finance/accounting/posting/domain/posting/rules/sales-invoice-issued.rule';
import { PurchaseInvoiceReceivedRule } from '@modules/finance/accounting/posting/domain/posting/rules/purchase-invoice-received.rule';
import { PayrollAccruedRule } from '@modules/finance/accounting/posting/domain/posting/rules/payroll-accrued.rule';
import { CashSessionClosedRule } from '@modules/finance/accounting/posting/domain/posting/rules/cash-session-closed.rule';
import { PlatformBookingSettledRule } from '@modules/finance/accounting/posting/domain/posting/rules/platform-booking-settled.rule';
import { PaymentMadeRule } from '@modules/finance/accounting/posting/domain/posting/rules/payment-made.rule';
import { PLATFORM_TENANT_PROVIDER } from '@modules/finance/accounting/posting/domain/interfaces/platform-tenant.provider.interface';
import { PlatformTenantProvider } from '@modules/finance/accounting/posting/infrastructure/platform-tenant.provider';
import { ChartOfAccountsCommandModule } from '@modules/finance/accounting/chart-of-accounts/application/commands/command.module';
import { FX_RATE_PROVIDER } from '@src/infrastructure/payment/links/fx-rate.port';
import { StaticEnvFxRateProvider } from '@src/infrastructure/payment/links/adapters/static-env-fx-rate.provider';
import { TcmbFxRateProvider } from '@src/infrastructure/payment/links/adapters/tcmb-fx-rate.provider';

const CommandHandlers = [
  PostFinancialEventHandler,
  ReverseJournalEntryHandler,
  GenerateYearEndClosingHandler,
];

@Module({
  // ChartOfAccountsCommandModule: platform kliniğinin hesap planını ilk
  // kullanımda kuran idempotent komut için (PlatformTenantProvider).
  imports: [JournalRepositoryModule, ChartOfAccountsCommandModule],
  providers: [
    ...CommandHandlers,
    PaymentReceivedRule,
    SalesInvoiceIssuedRule,
    PurchaseInvoiceReceivedRule,
    PayrollAccruedRule,
    CashSessionClosedRule,
    PlatformBookingSettledRule,
    PaymentMadeRule,
    { provide: PLATFORM_TENANT_PROVIDER, useClass: PlatformTenantProvider },
    {
      provide: POSTING_RULES,
      useFactory: (
        paymentReceived: PaymentReceivedRule,
        salesInvoiceIssued: SalesInvoiceIssuedRule,
        purchaseInvoiceReceived: PurchaseInvoiceReceivedRule,
        payrollAccrued: PayrollAccruedRule,
        cashSessionClosed: CashSessionClosedRule,
        platformBookingSettled: PlatformBookingSettledRule,
        paymentMade: PaymentMadeRule
      ) => [
        paymentReceived,
        salesInvoiceIssued,
        purchaseInvoiceReceived,
        payrollAccrued,
        cashSessionClosed,
        platformBookingSettled,
        paymentMade,
      ],
      inject: [
        PaymentReceivedRule,
        SalesInvoiceIssuedRule,
        PurchaseInvoiceReceivedRule,
        PayrollAccruedRule,
        CashSessionClosedRule,
        PlatformBookingSettledRule,
        PaymentMadeRule,
      ],
    },
    PostingRuleRegistry,
    // Model A — posting-time yabancı para çevrimi için FX kuru: TCMB işlem-tarihli döviz alış
    // kuru (VUK statutory); çözülemezse StaticEnv fallback.
    StaticEnvFxRateProvider,
    { provide: FX_RATE_PROVIDER, useClass: TcmbFxRateProvider },
  ],
  exports: [...CommandHandlers, PLATFORM_TENANT_PROVIDER],
})
export class PostingCommandModule {}
