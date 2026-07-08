/**
 * Grace süresi (SUBSCRIPTION_GRACE_DAYS) dolan PAST_DUE abonelikleri EXPIRED yapar
 * (expire cron'undan dispatch).
 */
export class ExpirePastDueSubscriptionsCommand {
  readonly __responseType!: void;
}
