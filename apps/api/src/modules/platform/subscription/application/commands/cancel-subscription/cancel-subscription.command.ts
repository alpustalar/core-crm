import { IGetContext } from '@common/decorators';

export class CancelSubscriptionCommand {
  readonly __responseType!: void;
  constructor(
    public readonly payload: {
      subscriptionId: string;
      /** true → anında CANCELED; false → dönem sonunda iptal (cancelAtPeriodEnd). */
      immediate: boolean;
      ctx: IGetContext;
    }
  ) {}
}
