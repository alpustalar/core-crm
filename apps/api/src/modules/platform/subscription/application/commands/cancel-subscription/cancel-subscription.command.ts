import { ActorContext } from '@common/interfaces';

export class CancelSubscriptionCommand {
  readonly __responseType!: void;
  constructor(
    public readonly subscriptionId: string,
    /** true → anında CANCELED; false → dönem sonunda iptal (cancelAtPeriodEnd). */
    public readonly immediate: boolean,
    public readonly actor: ActorContext
  ) {}
}
