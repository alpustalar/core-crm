import { SendVerificationEmailCommand } from '@modules/identity/user/application/commands/send-verification-email/send-verification-email.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  FIREBASE_SERVICE,
  IFirebaseService,
} from '@src/infrastructure/firebase/firebase.service.interface';
import { Inject } from '@nestjs/common';
import {
  IMailService,
  MAIL_SERVICE,
} from '@src/infrastructure/mail/interfaces/mail.service.interface';
import { SendVerificationEmailResponse } from '@modules/identity/user/application/commands/send-verification-email/send-verification-email.response';

@CommandHandler(SendVerificationEmailCommand)
export class SendVerificationEmailHandler
  implements
    ICommandHandler<
      SendVerificationEmailCommand,
      SendVerificationEmailResponse
    >
{
  constructor(
    @Inject(FIREBASE_SERVICE)
    private readonly firebaseService: IFirebaseService,
    @Inject(MAIL_SERVICE)
    private readonly mailService: IMailService
  ) {}

  async execute(
    command: SendVerificationEmailCommand
  ): Promise<SendVerificationEmailResponse> {
    const { email } = command;
    const link = await this.firebaseService.sendEmailVerificationLink(email);
    await this.mailService.sendVerificationEmail(email, link);
  }
}
