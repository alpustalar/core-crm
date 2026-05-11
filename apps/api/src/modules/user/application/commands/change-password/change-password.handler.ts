import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  FIREBASE_SERVICE_TOKEN,
  IFirebaseService,
} from '@modules/firebase/domain/interfaces/firebase.service.interface';
import { ChangePasswordCommand } from './change-password.command';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler
  implements ICommandHandler<ChangePasswordCommand, void>
{
  constructor(
    @Inject(FIREBASE_SERVICE_TOKEN)
    private readonly firebaseService: IFirebaseService
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const { dto, context } = command;

    await this.firebaseService.changePassword({
      id: context.actor.userId,
      password: dto.password,
    });
  }
}
