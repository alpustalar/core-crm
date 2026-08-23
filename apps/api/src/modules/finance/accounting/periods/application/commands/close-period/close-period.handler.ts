import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { GenerateYearEndClosingCommand } from '@modules/finance/accounting/posting/application/commands/generate-year-end-closing/generate-year-end-closing.command';
import { ClosePeriodCommand } from './close-period.command';
import {
  PeriodAlreadyClosedException,
  PeriodNotFoundException,
} from '@modules/finance/accounting/periods/domain/exceptions/period.exceptions';
import {
  ACCOUNTING_PERIOD_COMMAND_REPOSITORY,
  IAccountingPeriodCommandRepository,
} from '@modules/finance/accounting/periods/domain/repositories/accounting-period/accounting-period.command.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@CommandHandler(ClosePeriodCommand)
export class ClosePeriodHandler
  implements ICommandHandler<ClosePeriodCommand, void>
{
  constructor(
    @Inject(ACCOUNTING_PERIOD_COMMAND_REPOSITORY)
    private readonly accountingPeriodRepo: IAccountingPeriodCommandRepository,
    private readonly commandBus: TSCommandBus,
    private readonly txManager: TransactionManager,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(command: ClosePeriodCommand): Promise<void> {
    const period = await this.accountingPeriodRepo.findById(command.periodId);
    if (!period) throw new PeriodNotFoundException();

    // `periodId` URL'den geliyor; kapsam kaydın KENDİ kliniğinden doğrulanır.
    // Kontrol yokken, dönem kapatma yetkisi olan herhangi bir personel başka bir
    // kliniğin mali yılını kapatıp kapanış fişlerini defterine yazdırabiliyordu
    // (lock/reopen'da kontrol vardı, close'da yoktu).
    this.policyFactory
      .finance(command.ctx.actor, command.ctx.source)
      .evaluator.check((p) =>
        p.actorCanManageTargetClinic(period.clinicId.value)
      )
      .orThrow('accounting.period.close');

    // Transaction dışı hızlı-ret (belirgin kapalı dönemler için); kesin/otoriter
    // koruma aşağıdaki atomik claimForClosing'dir.
    period.validate.isOpenOrLocked.orThrow();

    await this.txManager.outboxRun(async () => {
      // Atomik sahiplenme: OPEN/LOCKED → CLOSED tek koşullu UPDATE ile. Eşzamanlı
      // ikinci istek satır kilidinde bekler, commit sonrası CLOSED görüp 0 satır
      // etkiler → false döner ve mükerrer kapanış fişi üretmeden reddedilir.
      const claimed = await this.accountingPeriodRepo.claimForClosing(
        period.id.value
      );
      if (!claimed) {
        throw new PeriodAlreadyClosedException(period.id.value, period.year);
      }

      // Kapanış fişleri: aynı transaction'a (ALS join) katılarak atılır.
      await this.commandBus.execute(
        new GenerateYearEndClosingCommand(
          {
            clinicId: period.clinicId.value,
            organizationId: period.organizationId.value,
            periodId: period.id.value,
            dateFrom: period.startsAt,
            dateTo: period.endsAt,
            entryDate: period.endsAt,
            performedById: command.ctx.actor.userId,
          },
          command.ctx
        )
      );
    });
  }
}
