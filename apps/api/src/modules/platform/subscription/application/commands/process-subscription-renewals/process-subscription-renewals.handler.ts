import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ProcessSubscriptionRenewalsCommand } from './process-subscription-renewals.command';
import {
  BILLING_ADAPTER,
  IBillingAdapter,
} from '@modules/platform/subscription/infrastructure/adapters/billing-adapter.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { Subscription } from '@modules/platform/subscription/domain/entities/subscription.entity';
import { Money } from '@src/domain/value-objects/money.vo';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { DateTimeManager } from '@common/utils';
import {
  ISubscriptionCommandRepository,
  SUBSCRIPTION_COMMAND_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/subscription/subscription.command.repository';
import {
  ISubscriptionPaymentMethodCommandRepository,
  SUBSCRIPTION_PAYMENT_METHOD_COMMAND_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/subscription-payment-method/subscription-payment-method.command.repository';

const RENEWAL_LABEL = 'Abonelik yenileme';
const BILLING_PERIOD_MONTHS = 1;

@CommandHandler(ProcessSubscriptionRenewalsCommand)
export class ProcessSubscriptionRenewalsHandler
  implements ICommandHandler<ProcessSubscriptionRenewalsCommand, void>
{
  private readonly logger = new Logger(ProcessSubscriptionRenewalsHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_COMMAND_REPOSITORY)
    private readonly subscriptionRepo: ISubscriptionCommandRepository,
    @Inject(SUBSCRIPTION_PAYMENT_METHOD_COMMAND_REPOSITORY)
    private readonly paymentMethodRepo: ISubscriptionPaymentMethodCommandRepository,
    @Inject(BILLING_ADAPTER)
    private readonly billingAdapter: IBillingAdapter,
    private readonly txManager: TransactionManager
  ) {}

  async execute(): Promise<void> {
    const due = await this.subscriptionRepo.findDueForRenewal(
      DateTimeManager.create()
    );
    if (due.length === 0) return;

    this.logger.log(`Yenileme: ${due.length} dönem-sonu abonelik işleniyor`);

    for (const candidate of due) {
      // Her abonelik ayrı transaction — biri hata verirse diğerleri etkilenmez.
      await this.txManager
        .outboxRun(() => this.processOne(candidate.id.value))
        .catch((err) =>
          this.logger.error(
            `Yenileme hatası (subscriptionId: ${candidate.id.value})`,
            err
          )
        );
    }
  }

  /**
   * Tek aboneliği yeniler. Aday listesi taramadan geliyor; burada abonelik kilitli
   * ve taze okunup yenileme koşulu YENİDEN doğrulanır.
   *
   * Neden: bu iş zamanlanmış ve birden çok API örneğinde/üst üste çalışabiliyor.
   * Kilitsizken iki çalıştırma aynı aboneliği "dönemi bitmiş" görüp kayıtlı karttan
   * iki kez çekim yapardı. Kilit tahsilat çağrısı boyunca tutulur — bağlantı havuzu
   * açısından maliyetli ama mükerrer çekimin alternatifi değil. (Kalıcı çözüm: satırda
   * bir "yenileme sahiplenildi" damgası; o zaman kilit HTTP öncesi bırakılabilir.)
   */
  private async processOne(subscriptionId: string): Promise<void> {
    const subscription =
      await this.subscriptionRepo.findByIdForUpdate(subscriptionId);
    if (!subscription) return;

    if (!subscription.isDueForRenewal(DateTimeManager.create())) {
      this.logger.verbose(
        `Yenileme atlandı, abonelik artık dönem-sonu değil: ${subscriptionId}`
      );
      return;
    }

    if (subscription.cancelAtPeriodEnd) {
      subscription.cancel();
      await this.subscriptionRepo.update(subscription);
      return;
    }

    // Çekilecek tutar ve kullanılacak kart doğrudan para hareketini belirliyor →
    // ikisi de command repo'dan (ana bağlantı, aynı transaction).
    const [savedCard, charge] = await Promise.all([
      this.paymentMethodRepo.findBySubscriptionId(subscriptionId),
      this.subscriptionRepo.findRenewalCharge(subscriptionId),
    ]);

    // Kayıtlı kart veya tahsil edilecek tutar yoksa otomatik çekim yapılamaz → PAST_DUE.
    if (!savedCard || !charge) {
      this.failRenewal(subscription);
      await this.subscriptionRepo.update(subscription);
      return;
    }

    const amount = Money.fromTrusted(
      charge.amount,
      charge.currency as CurrencyType
    );

    const result = await this.billingAdapter.chargeSavedCard({
      organizationId: subscription.organizationId.value,
      amount,
      label: RENEWAL_LABEL,
      savedCard: {
        cardUserKey: savedCard.cardUserKey,
        cardToken: savedCard.cardToken,
      },
      buyer: {
        id: subscription.organizationId.value,
        name: savedCard.buyer.name,
        surname: savedCard.buyer.surname,
        email: savedCard.buyer.email,
        gsmNumber: savedCard.buyer.gsmNumber,
        ip: savedCard.buyer.ip,
        city: savedCard.buyer.city ?? undefined,
        address: savedCard.buyer.address ?? undefined,
      },
    });

    if (result.success && result.iyzicoPaymentId) {
      const periodStart =
        subscription.currentPeriodEnd ?? DateTimeManager.create();
      const periodEnd = DateTimeManager.addMonths(
        periodStart,
        BILLING_PERIOD_MONTHS
      );
      subscription.renew({
        periodStart,
        periodEnd,
        iyzicoPaymentId: result.iyzicoPaymentId,
        event: {
          action: LogAction.SUBSCRIPTION_RENEWED,
          type: LogType.INFO,
          source: LogSource.SYSTEM,
        },
      });
    } else {
      this.failRenewal(subscription, result.errorMessage);
    }

    await this.subscriptionRepo.update(subscription);
  }

  private failRenewal(subscription: Subscription, errorMessage?: string): void {
    subscription.failPayment({
      action: LogAction.SUBSCRIPTION_PAYMENT_FAILED,
      type: LogType.WARNING,
      source: LogSource.SYSTEM,
      errorMessage,
    });
  }
}
