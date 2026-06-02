import { SendUserPasswordResetLinkBySelfCommand } from '@modules/user/application/commands/send-user-password-reset-link-by-self/send-user-password-reset-link-by-self.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  FIREBASE_SERVICE,
  IFirebaseService,
} from '@modules/firebase/domain/interfaces/firebase.service.interface';
import {
  IMailService,
  MAIL_SERVICE,
} from '@modules/mail/domain/interfaces/mail.service.interface';
import { SendUserPasswordResetLinkBySelfResponse } from '@modules/user/application/commands/send-user-password-reset-link-by-self/send-user-password-reset-link-by-self.response';

@CommandHandler(SendUserPasswordResetLinkBySelfCommand)
export class SendUserPasswordResetLinkBySelfHandler
  implements
    ICommandHandler<
      SendUserPasswordResetLinkBySelfCommand,
      SendUserPasswordResetLinkBySelfResponse
    >
{
  constructor(
    @Inject(FIREBASE_SERVICE)
    private readonly firebaseService: IFirebaseService,
    @Inject(MAIL_SERVICE)
    private readonly mailService: IMailService
  ) {}

  async execute(
    command: SendUserPasswordResetLinkBySelfCommand
  ): Promise<SendUserPasswordResetLinkBySelfResponse> {
    const {
      ctx: {
        actor: { email },
      },
    } = command;

    const link = await this.firebaseService.sendEmailVerificationLink(email);
    await this.mailService.sendVerificationEmail(email, link);
  }
}
