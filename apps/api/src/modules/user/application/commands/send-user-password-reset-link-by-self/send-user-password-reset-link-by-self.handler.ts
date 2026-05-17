import { SendUserPasswordResetLinkBySelfCommand } from '@modules/user/application/commands/send-user-password-reset-link-by-self/send-user-password-reset-link-by-self.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalOnly } from '@common/decorators/internal-only.decorator';
import { Inject } from '@nestjs/common';
import {
  FIREBASE_SERVICE_TOKEN,
  IFirebaseService,
} from '@modules/firebase/domain/interfaces/firebase.service.interface';
import {
  IMailService,
  MAIL_SERVICE_TOKEN,
} from '@modules/mail/domain/interfaces/mail.service.interface';

@CommandHandler(SendUserPasswordResetLinkBySelfCommand)
export class SendUserPasswordResetLinkBySelfHandler
  implements ICommandHandler<SendUserPasswordResetLinkBySelfCommand, void>
{
  constructor(
    @Inject(FIREBASE_SERVICE_TOKEN)
    private readonly firebaseService: IFirebaseService,
    @Inject(MAIL_SERVICE_TOKEN)
    private readonly mailService: IMailService
  ) {}

  @InternalOnly()
  async execute(command: SendUserPasswordResetLinkBySelfCommand) {
    const {
      context: {
        actor: { email },
      },
    } = command;
    const link = await this.firebaseService.sendEmailVerificationLink(email);
    await this.mailService.sendVerificationEmail(email, link);
  }
}
