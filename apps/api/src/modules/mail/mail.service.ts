import * as nodemailer from 'nodemailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_CONFIG } from '@common/constants';
import { verificationEmailTemplate } from './templates';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const port = this.configService.get<number>('EMAIL_SMTP_PORT', 587);

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_SMTP_HOST'),
      port: port,
      secure: port === 465,
      auth: {
        user: this.configService.get<string>('EMAIL_ADDRESS'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(to: string, link: string) {
    const EMAIL_ADDRESS = this.configService.get<string>('EMAIL_ADDRESS');
    if (!EMAIL_ADDRESS) {
      throw new Error('email ayar hatası ');
    }
    try {
      await this.transporter.sendMail({
        from: `"${APP_CONFIG.NAME}" <${EMAIL_ADDRESS}>`,
        to,
        subject: 'E-postanı Doğrula',
        html: verificationEmailTemplate(link),
      });
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('Doğrulama maili gönderilemedi.');
    }
  }
}
