/**
 * Dönemi geçmiş aktif abonelikleri işler (renewal cron'undan dispatch). cancelAtPeriodEnd
 * planlanmışsa iptal eder; değilse kayıtlı ödeme yöntemi olmadığından PAST_DUE'ya düşürür
 * (yenileme için tekrar ödeme gerekir — SubscriptionPaymentFailedEvent bildirim tetikler).
 */
export class ProcessSubscriptionRenewalsCommand {
  readonly __responseType!: void;
}
