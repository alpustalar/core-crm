import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import {
  IMailService,
  SendNotificationEmailInput,
} from '@src/infrastructure/mail/interfaces/mail.service.interface';
import {
  MAIL_CONFIG_TOKEN,
  MailConfig,
} from '@src/infrastructure/mail/config/mail-config.schema';
import {
  organizationDeletionRequestTemplate,
  verificationEmailTemplate,
} from '@src/infrastructure/mail/templates';
import { clinicSoftDeleteRequestByOrganizationOwnerTemplate } from '@src/infrastructure/mail/templates/clinic-soft-delete-request-by-organization-owner-template';

@Injectable()
export class MailService implements IMailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(
    // useFactory'nin Zod süzgecinden geçirip ürettiği tertemiz, kesinleşmiş config!
    @Inject(MAIL_CONFIG_TOKEN) private readonly config: MailConfig
  ) {
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

  async sendVerificationEmail(to: string, link: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"${this.config.APP_NAME}" <${this.config.EMAIL_ADDRESS}>`,
        to,
        subject: 'E-postanı Doğrula',
        html: verificationEmailTemplate(link),
      });
    } catch (e) {
      this.logger.error(`Doğrulama maili gönderilemedi: ${e}`);
      throw new InternalServerErrorException('Doğrulama maili gönderilemedi.');
    }
  }

  async sendClinicSoftDeleteRequestMail(to: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"${this.config.APP_NAME}" <${this.config.EMAIL_ADDRESS}>`,
        to,
        subject: 'Klinik Silme Talebi',
        html: clinicSoftDeleteRequestByOrganizationOwnerTemplate(),
      });
    } catch (e) {
      this.logger.error(`Klinik silme talebi maili gönderilemedi: ${e}`);
      throw new InternalServerErrorException(
        'Klinik silme talebi maili gönderilemedi.'
      );
    }
  }

  async sendOrganizationDeletionRequestMail(to: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"${this.config.APP_NAME}" <${this.config.EMAIL_ADDRESS}>`,
        to,
        subject: 'Organizasyon Silme Talebi',
        html: organizationDeletionRequestTemplate(),
      });
    } catch (e) {
      this.logger.error(`Organizasyon silme talebi maili gönderilemedi: ${e}`);
      throw new InternalServerErrorException(
        'Organizasyon silme talebi maili gönderilemedi.'
      );
    }
  }

  async sendNotificationEmail({
    to,
    subject,
    html,
  }: SendNotificationEmailInput): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"${this.config.APP_NAME}" <${this.config.EMAIL_ADDRESS}>`,
        to,
        subject,
        html,
      });
    } catch (e) {
      this.logger.error(`Bildirim e-postası gönderilemedi (${to}): ${e}`);
    }
  }
}
