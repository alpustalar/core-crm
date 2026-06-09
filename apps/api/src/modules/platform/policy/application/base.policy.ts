import { ActorContext } from '@common/interfaces';

export abstract class BasePolicy {
  protected readonly actorPriority: number;

  constructor(protected readonly actor: ActorContext) {
    this.actorPriority = actor.rolePriority ?? 0;
  }

  isSystemAdmin(): boolean {
    return this.actorPriority >= 100;
  }

  getActorContext(): ActorContext {
    return this.actor;
  }
}
