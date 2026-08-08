import { Account } from '@shared';

export const ACCOUNT_QUERY_REPOSITORY = Symbol('IAccountQueryRepository');

export interface IAccountQueryRepository {
  /** Şubenin hesap planının tamamı (sınırlı referans set; sayfalanmaz). */
  findAllByClinicId(clinicId: string): Promise<Account[]>;
}
