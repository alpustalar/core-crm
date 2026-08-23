import { IGetContext } from '@common/decorators/get-context.decorator';

/** Dönem sonu iptalini geri alır (undoCancellation). */
export class ResumeSubscriptionCommand {
  readonly __responseType!: void;
  constructor(
    public readonly subscriptionId: string,
    public readonly ctx: IGetContext
  ) {}
}
