import { APP_CONFIG, ENV } from '@common/constants';
import {
  MailConfig,
  mailConfigSchema,
} from '@modules/platform/mail/domain/config/mail-config.schema';
import { IMailService } from '@modules/platform/mail/domain/interfaces/mail.service.interface';
import { clinicSoftDeleteRequestByOrganizationOwnerTemplate } from '@modules/platform/mail/domain/templates/clinic-soft-delete-request-by-organization-owner-template';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  organizationDeletionRequestTemplate,
  verificationEmailTemplate,
} from './domain/templates';

@Injectable()
export class MailService implements IMailService {
  private readonly logger = new Logger(MailService.name);

  private transporter: nodemailer.Transporter;
  private readonly config: MailConfig;

  constructor(private readonly configService: ConfigService) {
    const result = mailConfigSchema.safeParse({
      EMAIL_ADDRESS: this.configService.get<string>(ENV.EMAIL_ADDRESS),
      EMAIL_PASSWORD: this.configService.get<string>(ENV.EMAIL_PASSWORD),
      EMAIL_SMTP_HOST: this.configService.get<string>(ENV.EMAIL_SMTP_HOST),
      EMAIL_SMTP_PORT: this.configService.get<string>(ENV.EMAIL_SMTP_PORT),
      APP_NAME: APP_CONFIG.NAME,
    });

    if (!result.success) {
      this.logger.error(result.error.format());
      throw new Error(
        'MailService başlatılamadı: Eksik veya hatalı yapılandırma.'
      );
    }

    this.config = result.data;

    this.transporter = nodemailer.createTransport({
      host: this.config.EMAIL_SMTP_HOST,
      port: this.config.EMAIL_SMTP_PORT,
      secure: this.config.EMAIL_SMTP_PORT === 465,
      auth: {
        user: this.config.EMAIL_ADDRESS,
        pass: this.config.EMAIL_PASSWORD,
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

  async sendClinicSoftDeleteRequestMail(to: string) {
    const EMAIL_ADDRESS = this.configService.get<string>(ENV.EMAIL_ADDRESS);
    if (!EMAIL_ADDRESS) {
      throw new Error('email ayar hatası ');
    }
    try {
      await this.transporter.sendMail({
        from: `"${APP_CONFIG.NAME}" <${EMAIL_ADDRESS}>`,
        to,
        subject: 'Klinik Silme Talebi',
        html: clinicSoftDeleteRequestByOrganizationOwnerTemplate(),
      });
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException(
        'Klinik silme talebi maili gönderilemedi.'
      );
    }
  }

  async sendOrganizationDeletionRequestMail(to: string) {
    const EMAIL_ADDRESS = this.configService.get<string>(ENV.EMAIL_ADDRESS);
    if (!EMAIL_ADDRESS) {
      throw new Error('email ayar hatası ');
    }
    try {
      await this.transporter.sendMail({
        from: `"${APP_CONFIG.NAME}" <${EMAIL_ADDRESS}>`,
        to,
        subject: 'Organizasyon Silme Talebi',
        html: organizationDeletionRequestTemplate(),
      });
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException(
        'Organizasyon silme talebi maili gönderilemedi.'
      );
    }
  }
}
