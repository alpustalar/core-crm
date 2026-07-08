import { PatientActorContext } from '@common/interfaces';

export abstract class PatientBasePolicy {
  constructor(protected readonly actor: PatientActorContext) {}
  getActorContext(): PatientActorContext {
    return this.actor;
  }
}
