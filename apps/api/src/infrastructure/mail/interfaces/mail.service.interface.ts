export interface SendNotificationEmailInput {
  to: string;
  subject: string;
  html: string;
}

export const MAIL_SERVICE = Symbol('MAIL_SERVICE_TOKEN');

export interface IMailService {
  sendVerificationEmail(to: string, link: string): Promise<void>;
  sendClinicSoftDeleteRequestMail(to: string): Promise<void>;
  sendOrganizationDeletionRequestMail(to: string): Promise<void>;
  /** Genel amaçlı bildirim e-postası (bildirim modülü kullanır). */
  sendNotificationEmail(input: SendNotificationEmailInput): Promise<void>;
}
