import { ProviderShift } from '@modules/clinical/provider/domain/entities/provider-shift.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const PROVIDER_SHIFT_COMMAND_REPOSITORY = Symbol(
  'IProviderShiftCommandRepository'
);
export interface IProviderShiftCommandRepository
  extends IBaseCommandRepository<ProviderShift> {
  /**
   * Verilen vardiyaları (tek provider + ilgili tarihler) tam değiştirir:
   * o tarihlerdeki mevcut vardiyalar silinip yenileri yazılır. Entity'ler her
   * çağrıda yeni id üretebildiği için id-bazlı upsert değil, replace semantiği.
   */
  replaceShiftsForDates(shifts: ProviderShift[]): Promise<void>;
  findShiftsByDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProviderShift[]>;
}
