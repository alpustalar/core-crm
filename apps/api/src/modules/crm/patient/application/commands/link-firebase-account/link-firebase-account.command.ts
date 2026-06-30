import { ICommand } from '@nestjs/cqrs';
import { LinkFirebaseAccountCommandResponse } from './link-firebase-account.response';

export class LinkFirebaseAccountCommand implements ICommand {
  readonly __responseType!: LinkFirebaseAccountCommandResponse;

  constructor(
    public readonly firebaseUid: string,
    public readonly patientId: string
  ) {}
}
