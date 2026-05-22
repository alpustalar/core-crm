import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  FIREBASE_SERVICE,
  IFirebaseService,
} from '@modules/firebase/domain/interfaces/firebase.service.interface';
import { ChangePasswordCommand } from './change-password.command';
import { ChangePasswordResponse } from '@modules/user/application/commands/change-password/change-password.response';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler
  implements ICommandHandler<ChangePasswordCommand, ChangePasswordResponse>
{
  constructor(
    @Inject(FIREBASE_SERVICE)
    private readonly firebaseService: IFirebaseService
  ) {}

  async execute(
    command: ChangePasswordCommand
  ): Promise<ChangePasswordResponse> {
    const { dto, ctx } = command;

    await this.firebaseService.changePassword({
      id: ctx.actor.userId,
      password: dto.password,
    });
  }
}
