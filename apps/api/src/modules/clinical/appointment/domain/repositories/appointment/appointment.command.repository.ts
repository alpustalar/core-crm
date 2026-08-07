import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { BatchPayload } from '@common/interfaces/batcy-payload.type';
import {
  CancelProviderAppointmentsData,
  FindDueForReminderData,
} from '@modules/clinical/appointment/domain/contracts/appointment.contracts';

export const APPOINTMENT_COMMAND_REPOSITORY = Symbol(
  'IAppointmentCommandRepository'
);

export interface IAppointmentCommandRepository
  extends IBaseCommandRepository<Appointment> {
  softDeleteAllAppointmentsByClinicId(clinicId: string): Promise<BatchPayload>;
  softDeleteAllByOrganizationId(organizationId: string): Promise<BatchPayload>;
  /** Doktor-günü toplu iptal: yalnız iptal edilebilir statüler (PENDING/CONFIRMED) güncellenir. */
  cancelAllByProviderInRange(
    data: CancelProviderAppointmentsData
  ): Promise<BatchPayload>;
  /**
   * Hatırlatma penceresindeki randevuları döner. Sonuç bir mutasyona (markReminderSent
   * + save) beslendiği için command repo'dadır (CQRS write-side) ve entity döner.
   */
  findDueForReminder(data: FindDueForReminderData): Promise<Appointment[]>;
  /** Hastanın aktif (gelecek + PENDING/CONFIRMED) randevu sayısı — maxActivePatientBookings gate'i. */
  countActiveByPatient(patientId: string): Promise<number>;
}
