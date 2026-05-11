import { SendVerificationEmailCommand } from '@modules/user/application/commands/send-verification-email/send-verification-email.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalOnly } from '@common/decorators/internal-only.decorator';
import {
  FIREBASE_SERVICE_TOKEN,
  IFirebaseService,
} from '@modules/firebase/domain/interfaces/firebase.service.interface';
import { Inject } from '@nestjs/common';
import {
  IMailService,
  MAIL_SERVICE_TOKEN,
} from '@modules/mail/domain/interfaces/mail.service.interface';

@CommandHandler(SendVerificationEmailCommand)
export class SendVerificationEmailHandler
  implements ICommandHandler<SendVerificationEmailCommand, void>
{
  constructor(
    @Inject(FIREBASE_SERVICE_TOKEN)
    private readonly firebaseService: IFirebaseService,
    @Inject(MAIL_SERVICE_TOKEN)
    private readonly mailService: IMailService
  ) {}

  @InternalOnly()
  async execute(command: SendVerificationEmailCommand) {
    const { email } = command;
    const link = await this.firebaseService.sendEmailVerificationLink(email);
    await this.mailService.sendVerificationEmail(email, link);
  }
}
