import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { JournalEntryUniqueConstraintException } from '@modules/finance/accounting/posting/domain/exceptions/journal-entry.exceptions';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetFinancialEventByIdQuery } from '@modules/finance/accounting/financial-events/application/queries/get-financial-event-by-id/get-financial-event-by-id.query';
import { FindPeriodByDateQuery } from '@modules/finance/accounting/periods/application/queries/find-period-by-date/find-period-by-date.query';
import { GetChartOfAccountsQuery } from '@modules/finance/accounting/chart-of-accounts/application/queries/get-chart-of-accounts/get-chart-of-accounts.query';
import { GetClinicCurrencyQuery } from '@modules/organization/clinic/application/queries/get-clinic-currency/get-clinic-currency.query';
import {
  FX_RATE_PROVIDER,
  IFxRateProvider,
} from '@src/infrastructure/payment/links/fx-rate.port';
import {
  IJournalCommandRepository,
  JOURNAL_COMMAND_REPOSITORY,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { JournalEntry } from '@modules/finance/accounting/posting/domain/entities/journal-entry.entity';
import { AccountResolver } from '@modules/finance/accounting/posting/domain/posting/account-resolver';
import { FxConversion } from '@modules/finance/accounting/posting/domain/posting/fx-conversion';
import { PostingRuleRegistry } from '@modules/finance/accounting/posting/domain/posting/posting-rule.registry';
import { PostFinancialEventCommand } from './post-financial-event.command';
import { CreateJournalEntryLineProps } from '@modules/finance/accounting/posting/domain/contracts/posting.contracts';
import { AccountingPeriodStatusSchema } from '@shared';

@CommandHandler(PostFinancialEventCommand)
export class PostFinancialEventHandler implements ICommandHandler<
  PostFinancialEventCommand,
  string | null
> {
  private readonly logger = new Logger(PostFinancialEventHandler.name);

  constructor(
    @Inject(JOURNAL_COMMAND_REPOSITORY)
    private readonly journalCommandRepo: IJournalCommandRepository,
    private readonly registry: PostingRuleRegistry,
    @Inject(FX_RATE_PROVIDER)
    private readonly fxRateProvider: IFxRateProvider,
    private readonly queryBus: TSQueryBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: PostFinancialEventCommand): Promise<string | null> {
    const { financialEventId, ctx } = command;

    const { data: event } = await this.queryBus.execute(
      new GetFinancialEventByIdQuery(financialEventId, ctx)
    );
    if (!event) {
      this.logger.warn(
        `FinancialEvent bulunamadı, atlandı: ${financialEventId}`
      );
      return null;
    }

    // İdempotentlik: olay zaten fişlenmişse mevcut fişi döndür.
    const existing = await this.journalCommandRepo.findByEventId(event.id);
    if (existing) return existing.id;

    const rule = this.registry.get(event.type);
    if (!rule) {
      this.logger.log(`Posting kuralı yok, atlandı: ${event.type}`);
      return null;
    }

    const { data: period } = await this.queryBus.execute(
      new FindPeriodByDateQuery(event.clinicId, event.occurredAt, ctx)
    );
    if (!period) {
      throw new Error(
        `${event.occurredAt.toISOString()} tarihi için muhasebe dönemi yok.`
      );
    }
    if (period.status !== AccountingPeriodStatusSchema.enum.OPEN) {
      throw new Error(`Dönem ${period.year} kapalı/kilitli; fiş atılamaz.`);
    }

    const { data: accounts } = await this.queryBus.execute(
      new GetChartOfAccountsQuery(event.clinicId, ctx)
    );
    const resolver = new AccountResolver(accounts);

    const draft = rule.build(event, {
      organizationId: event.organizationId,
      clinicId: event.clinicId,
    });

    // Model A — defter tek fonksiyonel para biriminde tutulur. İşlem yabancı para
    // ise posting anında çevrilir: debit/credit fonksiyonel olur, orijinal tutar +
    // kur (original*/fxRate) izlenebilirlik için saklanır.
    const { data: functionalCurrency } = await this.queryBus.execute(
      new GetClinicCurrencyQuery(event.clinicId)
    );
    const txCurrency = draft.currency ?? functionalCurrency;
    const fxRate =
      txCurrency === functionalCurrency
        ? null
        : new Decimal(
            // İşlem tarihindeki kur (VUK/TCMB döviz alış) — anlık kur değil.
            await this.fxRateProvider.getRate(
              txCurrency,
              functionalCurrency,
              event.occurredAt
            )
          );

    const lines: CreateJournalEntryLineProps[] = draft.lines.map((line) => {
      const account = resolver.resolve(line.accountCode);

      if (!account.isPostable) {
        throw new Error(`Yaprak olmayan hesaba fiş atılamaz: ${account.code}`);
      }

      if (account.requiresParty && !line.partyId) {
        throw new Error(
          `${account.code} hesabında alt defter (party) zorunludur.`
        );
      }

      // Tutar çevrimi saf domain'de; handler yalnızca kuru çözüp orchestrate eder.
      const converted = FxConversion.convertLine({
        debit: line.debit,
        credit: line.credit,
        txCurrency,
        functionalCurrency,
        rate: fxRate,
      });

      return {
        accountId: account.id,
        partyId: line.partyId,
        lineDesc: line.desc,
        ...converted,
      };
    });

    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);
    for (const line of lines) {
      totalDebit = totalDebit.plus(new Decimal(line.debit?.toString() ?? '0'));
      totalCredit = totalCredit.plus(
        new Decimal(line.credit?.toString() ?? '0')
      );
    }

    // Yabancı para çevriminde satır-başı yuvarlama artığını Kambiyo farkına yaz
    // (646 Kâr / 656 Zarar) ki çift taraflı denge korunsun.
    if (fxRate) {
      const balance = FxConversion.roundingBalance(totalDebit, totalCredit);
      if (balance) {
        const isGain = balance.side === 'CREDIT';
        const kambiyo = resolver.resolve(isGain ? '646' : '656');
        lines.push({
          accountId: kambiyo.id,
          partyId: null,
          currency: functionalCurrency,
          debit: isGain ? undefined : balance.amount,
          credit: isGain ? balance.amount : undefined,
          lineDesc: 'Kambiyo kur farkı (çevrim yuvarlaması)',
        });
        if (isGain) totalCredit = totalCredit.plus(balance.amount);
        else totalDebit = totalDebit.plus(balance.amount);
      }
    }

    if (!totalDebit.equals(totalCredit)) {
      throw new Error(
        'Yevmiye fişi borç ve alacak toplamları eşit olmalıdır. Mizan tutarsızlığı engellendi.'
      );
    }

    const entry = JournalEntry.createDraft({
      organizationId: event.organizationId,
      clinicId: event.clinicId,
      periodId: period.id,
      entryDate: draft.date,
      description: draft.description,
      eventId: event.id,
      performedById: event.performedById,
      lines,
    });

    // 1. entryNo'yu izole transaction'da üret; commit olunca numara kesinleşir.
    const entryNo = await this.txManager.outboxRun(async () =>
      this.journalCommandRepo.nextEntryNo(event.clinicId, period.id)
    );

    // 2. Entity'yi transaction dışında saf olarak mühürle.
    //    Save başarısız olsa bile mutation, commit edilmiş entryNo'ya bağlı kalır.
    entry.post(entryNo);

    // 3. Mühürlenmiş entity'yi kaydet.
    try {
      return await this.txManager.outboxRun(async () => {
        const saved = await this.journalCommandRepo.create(entry);
        return saved.id;
      });
    } catch (error) {
      // Eşzamanlı posting aynı olay için fiş üretmiş olabilir (event_id unique).
      if (error instanceof JournalEntryUniqueConstraintException) {
        const raced = await this.journalCommandRepo.findByEventId(event.id);
        if (raced) return raced.id;
      }
      throw error;
    }
  }
}
