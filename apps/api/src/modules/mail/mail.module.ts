import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MAIL_SERVICE_TOKEN } from '@modules/mail/domain/interfaces/mail.service.interface';

@Module({
  providers: [
    {
      provide: MAIL_SERVICE_TOKEN,
      useClass: MailService,
    },
  ],
  exports: [MAIL_SERVICE_TOKEN],
})
export class MailModule {}
