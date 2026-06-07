export interface IMailService {
  sendVerificationEmail(to: string, link: string): Promise<void>;
  sendClinicSoftDeleteRequestMail(to: string): Promise<void>;
  sendOrganizationDeletionRequestMail(to: string): Promise<void>;
}

export const MAIL_SERVICE = Symbol('MAIL_SERVICE_TOKEN');
