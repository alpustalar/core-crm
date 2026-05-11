import { ClinicAvailability, ClinicException } from '@shared';

export const CLINIC_AVAILABILITY_REPO_TOKEN = Symbol(
  'IClinicAvailabilityRepository'
);

export interface IClinicAvailabilityRepository {
  /**
   * Kliniğin haftalık çalışma planındaki ilgili günü getirir.
   */
  findByClinicAndDay(
    clinicId: string,
    dayOfWeek: number
  ): Promise<ClinicAvailability | null>;

  /**
   * Kliniğin tüm haftalık çalışma planını (en fazla 7 kayıt) getirir.
   */
  findAllByClinicId(clinicId: string): Promise<ClinicAvailability[]>;

  /**
   * Belirli bir tarihteki klinik istisnasını (tatil, özel gün vb.) getirir.
   */
  findExceptionByClinicAndDate(
    clinicId: string,
    date: Date
  ): Promise<ClinicException | null>;

  /**
   * Verilen tarih aralığındaki tüm klinik istisnalarını getirir.
   */
  findExceptionsByDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ClinicException[]>;

  /**
   * Belirli bir tarihte kliniğin kapalı olduğuna dair istisna kaydını döner.
   */
  findClosedExceptionByDate(
    clinicId: string,
    date: Date
  ): Promise<Partial<ClinicException> | null>;
}
