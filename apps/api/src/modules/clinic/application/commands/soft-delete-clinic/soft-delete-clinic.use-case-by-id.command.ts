import { ActorContext } from '@common/interfaces';

export class SoftDeleteClinicCommand {
  constructor(
    public readonly clinicId: string,
    public readonly actor?: ActorContext
  ) {}
}
