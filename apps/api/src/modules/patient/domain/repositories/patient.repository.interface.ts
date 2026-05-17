import { Patient } from '@shared';

export const PATIENT_REPO_TOKEN = Symbol('PATIENT_REPO_TOKEN');
export interface IPatientRepository {
  /**
   * ID ile hastayı bulur, sadece kimlik bilgilerini döner.
   */
  find(id: string): Promise<Patient | null>;
}
