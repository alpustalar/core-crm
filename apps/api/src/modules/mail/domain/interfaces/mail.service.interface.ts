export interface IMailService {
  sendVerificationEmail(to: string, link: string): Promise<void>;
  sendClinicSoftDeleteRequestMail(to: string): Promise<void>;
}

export const MAIL_SERVICE_TOKEN = Symbol('MAIL_SERVICE_TOKEN');
