import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { TreatmentCharge } from '@modules/finance/treatment-charge/domain/entities/treatment-charge.entity';

export const TREATMENT_CHARGE_COMMAND_REPOSITORY = Symbol(
  'ITreatmentChargeCommandRepository'
);

export interface ITreatmentChargeCommandRepository
  extends IBaseCommandRepository<TreatmentCharge> {
  create(entity: TreatmentCharge): Promise<TreatmentCharge>;

  /**
   * Randevunun iptal edilmemiş satırları. Command Context'te okunur çünkü
   * fatura/tahsilat tutarı bu satırlardan türer ve karar besler.
   */
  findActiveByAppointmentId(appointmentId: string): Promise<TreatmentCharge[]>;
}
