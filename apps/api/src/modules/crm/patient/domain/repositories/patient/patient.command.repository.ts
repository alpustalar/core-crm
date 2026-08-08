import { Patient } from '@modules/crm/patient/domain/entities/patient.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { FindPatientByContactFilter } from '@modules/crm/patient/domain/contracts/patient.contracts';

export const PATIENT_COMMAND_REPOSITORY = Symbol('IPatientCommandRepository');

export interface IPatientCommandRepository
  extends IBaseCommandRepository<Patient> {
  /**
   * Aynı iletişim bilgisiyle hasta zaten var mı? Yeni kayıt açılıp açılmayacağını
   * belirlediği için Command Context'te okunur.
   */
  findByContact(filter: FindPatientByContactFilter): Promise<Patient | null>;
}
