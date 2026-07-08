import { ActorContext } from '@common/interfaces';

/** Dönem sonu iptalini geri alır (undoCancellation). */
export class ResumeSubscriptionCommand {
  readonly __responseType!: void;
  constructor(
    public readonly subscriptionId: string,
    public readonly actor: ActorContext
  ) {}
}
