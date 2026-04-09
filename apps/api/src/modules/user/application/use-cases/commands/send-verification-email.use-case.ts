import { MailService } from '@modules/mail/mail.service';
import { FirebaseService } from '@modules/firebase/firebase.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SendVerificationEmailUseCase {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly mailService: MailService
  ) {}

  async execute(email: string) {
    const link = await this.firebaseService.sendEmailVerificationLink(email);
    await this.mailService.sendVerificationEmail(email, link);
  }
}
